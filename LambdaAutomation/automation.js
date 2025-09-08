require('dotenv').config();
const mysql = require('mysql2/promise');
const axios = require('axios');

// Note that state change from "ready_to_process to processing/complete is to be done by the model itself and not to be done in our automation script"

class VideoProcessingAutomation {
    constructor() {
        this.dbConfig = {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            timezone: '+00:00'
        };

        this.lambdaAIConfig = {
            apiKey: process.env.LAMBDA_AI_API_KEY,
            baseURL: 'https://cloud.lambda.ai/api/v1',
            instanceType: process.env.VM_INSTANCE_TYPE || 'gpu_1x_a100_sxm4',
            region: process.env.VM_REGION || 'us-west-1',
            sshKeyName: process.env.SSH_KEY_NAME || 'lambda-ai-ssh-key',
            fileSystemName: process.env.FILE_SYSTEM_NAME || 'my-ai-model-storage'
        };

        this.config = {
            idleTimeoutMinutes: parseInt(process.env.IDLE_TIMEOUT_MINUTES) || 5,
            pollingIntervalSeconds: parseInt(process.env.POLLING_INTERVAL_SECONDS) || 30
        };

        this.vmState = {
            isRunning: false,
            lastActivityTime: null,
            activeInstanceId: null
        };

        console.log('Video Processing Automation initialized');
    }

    async connectToDatabase() {
        try {
            this.db = await mysql.createConnection(this.dbConfig);
            console.log('Database connected successfully');
            return true;
        } catch (error) {
            console.error('Database connection failed:', error.message);
            return false;
        }
    }

    async checkPendingJobs() {
        try {
            const [rows] = await this.db.execute(
                // This query will need to be modified once we get the DB access and schema
                'SELECT id, video_url, created_at FROM videos WHERE status = ? ORDER BY created_at ASC LIMIT 10',
                ['ready_to_process']
            );
            console.log(`Found ${rows.length} pending jobs`);
            return rows;
        } catch (error) {
            console.error('Error checking pending jobs:', error.message);
            return [];
        }
    }

    async getVMStatus() {
        try {
            const response = await axios.get(
                `${this.lambdaAIConfig.baseURL}/instances`,
                {
                    auth: { username: this.lambdaAIConfig.apiKey, password: '' },
                    headers: { 'Content-Type': 'application/json' }
                }
            );
            const instances = response.data.data || [];
            const runningInstance = instances.find(
                inst => inst.instance_type.name === this.lambdaAIConfig.instanceType && inst.status === 'running'
            );
            this.vmState.isRunning = !!runningInstance;
            this.vmState.activeInstanceId = runningInstance ? runningInstance.id : null;
            return runningInstance ? 'running' : 'stopped';
        } catch (error) {
            console.error('Error getting VM status:', error.message);
            return 'unknown';
        }
    }

    // async startVM() {
    //     try {
    //         console.log('Provisioning new Lambda.ai instance...');
    //         const userDataScript = `
    //             #cloud-config
    //             package_update: true
    //             packages:
    //               - python3-pip
    //             runcmd:
    //               - pip3 install torch torchvision mysql-connector-python boto3
    //               - echo "DB_HOST=${this.dbConfig.host}" >> /etc/environment
    //               - echo "DB_USER=${this.dbConfig.user}" >> /etc/environment
    //               - echo "DB_PASS=${this.dbConfig.password}" >> /etc/environment
    //               - echo "DB_NAME=${this.dbConfig.database}" >> /etc/environment
    //               - echo "AWS_ACCESS_KEY_ID=${process.env.AWS_ACCESS_KEY_ID}" >> /etc/environment
    //               - echo "AWS_SECRET_ACCESS_KEY=${process.env.AWS_SECRET_ACCESS_KEY}" >> /etc/environment
    //               - echo "S3_BUCKET=${process.env.S3_BUCKET}" >> /etc/environment
    //               - cd /lambda/nfs/${this.lambdaAIConfig.fileSystemName}
    //               - python3 processing_script.py
    //                         `;
    //         const userDataHex = Buffer.from(userDataScript).toString('hex');

    //         const response = await axios.post(
    //             `${this.lambdaAIConfig.baseURL}/instance-operations/launch`,
    //             {
    //                 region_name: this.lambdaAIConfig.region,
    //                 instance_type_name: this.lambdaAIConfig.instanceType,
    //                 ssh_key_names: [this.lambdaAIConfig.sshKeyName],
    //                 file_system_names: [this.lambdaAIConfig.fileSystemName],
    //                 quantity: 1,
    //                 user_data: userDataHex
    //             },
    //             {
    //                 auth: { username: this.lambdaAIConfig.apiKey, password: '' },
    //                 headers: { 'Content-Type': 'application/json' }
    //             }
    //         );

    //         this.vmState.activeInstanceId = response.data.data[0].id;
    //         this.vmState.isRunning = true;
    //         this.vmState.lastActivityTime = new Date();
    //         console.log('Instance launched:', this.vmState.activeInstanceId);
    //         return true;
    //     } catch (error) {
    //         console.error('Error starting VM:', error.message);
    //         return false;
    //     }
    // }

    async terminateVM() {
        try {
            if (!this.vmState.activeInstanceId) {
                console.log('No active instance to terminate');
                return false;
            }
            console.log('Terminating Lambda.ai instance:', this.vmState.activeInstanceId);
            const response = await axios.post(
                `${this.lambdaAIConfig.baseURL}/instance-operations/terminate`,
                { instance_ids: [this.vmState.activeInstanceId] },
                {
                    auth: { username: this.lambdaAIConfig.apiKey, password: '' },
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            if (response.data.data) {
                console.log('VM terminated successfully');
                this.vmState.activeInstanceId = null;
                this.vmState.isRunning = false;
                this.vmState.lastActivityTime = null;
                return true;
            } else {
                console.error('Failed to terminate VM:', response.data);
                return false;
            }
        } catch (error) {
            console.error('Error terminating VM:', error.message);
            return false;
        }
    }

    async checkProcessingActivity() {
        try {
            const [rows] = await this.db.execute(
                // we will be having to update this query too as per the DB schema 
                'SELECT COUNT(*) as processing_count, MAX(last_heartbeat) as last_heartbeat FROM videos WHERE status = ? AND vm_instance_id = ?',
                ['processing', this.vmState.activeInstanceId]
            );

            const isProcessing = rows[0].processing_count > 0;
            if (isProcessing) {
                this.vmState.lastActivityTime = new Date(rows[0].last_heartbeat || Date.now());
                console.log(`VM is actively processing ${rows[0].processing_count} job(s)`);
            } else {
                console.log('VM has no active processing jobs');
            }
            return isProcessing;
        } catch (error) {
            console.error('Error checking processing activity:', error.message);
            return false;
        }
    }

    shouldTerminateVM() {
        if (!this.vmState.isRunning || !this.vmState.lastActivityTime) return false;

        const idleTime = (new Date() - this.vmState.lastActivityTime) / 1000 / 60;
        const shouldTerminate = idleTime >= this.config.idleTimeoutMinutes;

        if (shouldTerminate) {
            console.log(`VM has been idle for ${idleTime.toFixed(1)} minutes, terminating...`);
        } else {
            console.log(`VM idle for ${idleTime.toFixed(1)} minutes (${this.config.idleTimeoutMinutes - idleTime.toFixed(1)} minutes until termination)`);
        }
        return shouldTerminate;
    }

    async handler() {
        try {
            console.log('Starting automation cycle...');

            if (!this.db && !(await this.connectToDatabase())) {
                throw new Error('Failed to connect to database');
            }

            const pendingJobs = await this.checkPendingJobs();
            const vmStatus = await this.getVMStatus();
            const isProcessing = this.vmState.isRunning ? await this.checkProcessingActivity() : false;

            if (pendingJobs.length > 0) {
                if (!this.vmState.isRunning) {
                    console.log('Work available and VM stopped. Starting VM...');
                    await this.startVM();
                } else {
                    console.log('Work available and VM already running');
                }
                this.vmState.lastActivityTime = new Date();
            } else if (this.vmState.isRunning && !isProcessing && this.shouldTerminateVM()) {
                await this.terminateVM();
            } else if (!this.vmState.isRunning) {
                console.log('No work and VM stopped');
            }
            console.log('Cycle complete');
        } catch (error) {
            console.error('Error in automation cycle:', error.message);
            throw error;
        } finally {
            if (this.db) await this.db.end();
        }
    }
}

exports.handler = async (event, context) => {
    const automation = new VideoProcessingAutomation();
    await automation.handler();
    return {
        statusCode: 200,
        body: 'Automation cycle completed'
    };
};