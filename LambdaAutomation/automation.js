import mysql from 'mysql2/promise';
import axios from 'axios';
import { Client } from 'ssh2';

export class VideoProcessingAutomation {

    constructor() {
        // Database configuration from environment variables
        this.dbConfig = {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            timezone: '+00:00'
        };
    
        // Lambda AI API configuration
        this.lambdaAIConfig = {
            apiKey: process.env.LAMBDA_AI_API_KEY,
            //Try to change base URL baseURL: 'https://cloud.lambdalabs.com/api/v1' when this one is not working
            baseURL: 'https://cloud.lambda.ai/api/v1',
            instanceType: process.env.VM_INSTANCE_TYPE || 'gpu_1x_h100_pcie',
            region: process.env.VM_REGION || 'us-west-1',
            sshKeyName: process.env.SSH_KEY_NAME || 'lambda-ai-ssh-key'
        };
    
        // Configuration for VM lifecycle management
        this.config = {
            idleTimeoutMinutes: parseInt(process.env.IDLE_TIMEOUT_MINUTES) || 5,
            maxRetries: parseInt(process.env.MAX_RETRIES) || 3,
            healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000, // 30 seconds
            vmReadyTimeout: parseInt(process.env.VM_READY_TIMEOUT) || 300000, // 5 minutes
            sshTimeout: parseInt(process.env.SSH_TIMEOUT) || 30000
        };
    
        // GitHub token from environment variable
        this.githubToken = process.env.GITHUB_TOKEN;
    
        // Hard-coded SSH keys for VM access
        this.sshPrivateKey = `-----BEGIN OPENSSH PRIVATE KEY-----
    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
    -----END OPENSSH PRIVATE KEY-----`;
    
        console.log('Video Processing Automation initialized with VM lifecycle management');
    }
    
    // Add rate limiting utility
    async rateLimitedRequest(requestFn) {
        const result = await requestFn();
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        return result;
    }
    
    // Connect to the MySQL database
    async connectToDatabase() {
        return await mysql.createConnection(this.dbConfig);
    }
    
    // Check for pending jobs with processing_status = 'cv_ready'
    async checkPendingJobs(db) {
        const [rows] = await db.execute(
            'SELECT match_id, m3u8_link FROM matches WHERE processing_status = ? ORDER BY created_at ASC LIMIT 1',
            ['cv_ready']
        );
        return rows;
    }
    
    // Find a free VM (is_free = 1)
    async findFreeVM(db) {
        const [rows] = await db.execute(
            'SELECT * FROM vms WHERE is_free = 1 LIMIT 1'
        );
        return rows.length > 0 ? rows[0] : null;
    }
    
    // Get all VMs from database
    async getAllVMs(db) {
        const [rows] = await db.execute('SELECT * FROM vms');
        return rows;
    }
    
    // Get processing status of a match
    async getMatchProcessingStatus(db, match_id) {
        const [rows] = await db.execute(
            'SELECT processing_status FROM matches WHERE match_id = ?',
            [match_id]
        );
        return rows.length > 0 ? rows[0].processing_status : null;
    }
    
    // Update VM with assigned match_id and set is_free = 0
    async updateVM(db, vm_id, match_id) {
        await db.execute(
            'UPDATE vms SET assigned_match_id = ?, is_free = 0, last_activity = NOW() WHERE vm_id = ?',
            [match_id, vm_id]
        );
    }
    
    // Update VM last activity timestamp
    async updateVMActivity(db, vm_id) {
        await db.execute(
            'UPDATE vms SET last_activity = NOW() WHERE vm_id = ?',
            [vm_id]
        );
    }
    
    // Mark VM as free
    async markVMFree(db, vm_id) {
        await db.execute(
            'UPDATE vms SET is_free = 1, assigned_match_id = NULL, last_activity = NOW() WHERE vm_id = ?',
            [vm_id]
        );
    }
    
    // Remove VM from database
    async removeVMFromDB(db, vm_id) {
        await db.execute('DELETE FROM vms WHERE vm_id = ?', [vm_id]);
    }
    
    // Get VM status from Lambda AI API - Modified to use rate limiting
    async getVMStatusFromAPI(vm_id) {
        try {
            const response = await this.rateLimitedRequest(() => axios.get(
                `${this.lambdaAIConfig.baseURL}/instances/${vm_id}`,
                {
                    auth: { username: this.lambdaAIConfig.apiKey, password: '' },
                    headers: { 'Content-Type': 'application/json' }
                }
            ));
            return {
                status: response.data.data.status,
                ip: response.data.data.ip
            };
        } catch (error) {
            if (error.response?.status === 404) {
                console.log(`VM ${vm_id} not found in Lambda AI - may have been terminated`);
                return null;
            }
            console.error(`Error fetching status for VM ${vm_id}:`, error.message);
            throw error;
        }
    }
    
    // Check if VM is healthy and responsive
    async checkVMHealth(vm_id, ip) {
        try {
            return await new Promise((resolve) => {
                const conn = new Client();
                conn.on('ready', () => {
                    conn.exec('echo "health_check"', (err, stream) => {
                        conn.end();
                        if (err) {
                            resolve(false);
                            return;
                        }
                        stream.on('close', (code) => {
                            resolve(code === 0);
                        }).on('data', () => {
                            // Health check successful
                        }).stderr.on('data', () => {
                            resolve(false);
                        });
                    });
                }).on('error', () => {
                    resolve(false);
                }).connect({
                    host: ip,
                    username: 'ubuntu',
                    privateKey: this.sshPrivateKey,
                    readyTimeout: 10000 // Shorter timeout for health check
                });
            });
        } catch (error) {
            return false;
        }
    }
    
    // Create a new VM - Modified to use rate limiting
    async createNewVM(db, match_id) {
        try {
            const userData = `#cloud-config
    runcmd:
    - git clone https://${this.githubToken}@github.com/nadhir/FootBall-Analysis-Project.git /home/ubuntu/FootBall-Analysis-Project || echo "Repo exists"
    - cd /home/ubuntu/FootBall-Analysis-Project && git checkout tags/v1.1.0 -b v1.1.0-branch || git checkout v1.1.0-branch
    - cd /home/ubuntu/FootBall-Analysis-Project && pip install -r requirements.txt
    `;
            const response = await this.rateLimitedRequest(() => axios.post(
                `${this.lambdaAIConfig.baseURL}/instance-operations/launch`,
                {
                    region_name: this.lambdaAIConfig.region,
                    instance_type_name: this.lambdaAIConfig.instanceType,
                    ssh_key_names: [this.lambdaAIConfig.sshKeyName],
                    user_data: userData
                },
                {
                    auth: { username: this.lambdaAIConfig.apiKey, password: '' },
                    headers: { 'Content-Type': 'application/json' }
                }
            ));
        
            const vm_id = response.data.data.instance_ids[0];
            // Insert new VM into database with created timestamp
            await db.execute(
                'INSERT INTO vms (vm_id, is_free, assigned_match_id, last_activity, created_at) VALUES (?, 0, ?, NOW(), NOW())',
                [vm_id, match_id]
            );
            console.log(`Created new VM ${vm_id} and assigned match ${match_id}`);
            return vm_id;
        } catch (error) {
            console.error('Error creating new VM:', error.message);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            }
            throw error;
        }
    }
    
    // Wait for the instance to become active
    async waitForInstanceReady(vm_id) {
        const maxAttempts = Math.ceil(this.config.vmReadyTimeout / 10000);
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                const vmInfo = await this.getVMStatusFromAPI(vm_id);
                if (vmInfo && vmInfo.status === 'active') {
                    console.log(`VM ${vm_id} is active`);
                    return vmInfo.ip;
                }
            } catch (error) {
                console.error(`Error checking VM status: ${error.message}`);
            }
            await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
        }
        throw new Error(`Timeout waiting for VM ${vm_id} to become active`);
    }
    
    // Terminate a VM - Modified to use rate limiting
    async terminateVM(vm_id) {
        try {
            await this.rateLimitedRequest(() => axios.post(
                `${this.lambdaAIConfig.baseURL}/instance-operations/terminate`,
                {
                    instance_ids: [vm_id]
                },
                {
                    auth: { username: this.lambdaAIConfig.apiKey, password: '' },
                    headers: { 'Content-Type': 'application/json' }
                }
            ));
            console.log(`Terminated VM ${vm_id}`);
            return true;
        } catch (error) {
            console.error(`Error terminating VM ${vm_id}:`, error.message);
            return false;
        }
    }
    
    // Check if VM should be terminated due to idle time
    async shouldTerminateVM(db, vm, pendingJobsCount) {
        try {
            // Don't terminate if there are pending jobs
            if (pendingJobsCount > 0) {
                console.log(`VM ${vm.vm_id}: Pending jobs exist (${pendingJobsCount}), will not terminate`);
                return false;
            }
        
            // Don't terminate if VM is currently processing a job
            if (!vm.is_free) {
                console.log(`VM ${vm.vm_id}: Currently busy, will not terminate`);
                return false;
            }
        
            // Calculate idle time
            const lastActivity = new Date(vm.last_activity);
            const now = new Date();
            const idleTimeMinutes = (now - lastActivity) / (1000 * 60);
            const shouldTerminate = idleTimeMinutes >= this.config.idleTimeoutMinutes;
        
            if (shouldTerminate) {
                console.log(`VM ${vm.vm_id}: Idle for ${idleTimeMinutes.toFixed(1)} minutes, scheduling for termination`);
            } else {
                console.log(`VM ${vm.vm_id}: Idle for ${idleTimeMinutes.toFixed(1)}/${this.config.idleTimeoutMinutes} minutes`);
            }
        
            return shouldTerminate;
        } catch (error) {
            console.error(`Error checking if VM ${vm.vm_id} should terminate:`, error.message);
            return false;
        }
    }
    
    // Clean up stale or terminated VMs
    async cleanupVMs(db) {
        try {
            console.log('Starting VM cleanup process...');
            const vms = await this.getAllVMs(db);
            const pendingJobs = await this.checkPendingJobs(db);
            const pendingJobsCount = pendingJobs.length;
        
            for (const vm of vms) {
                try {
                    // Check VM status from API
                    const vmInfo = await this.getVMStatusFromAPI(vm.vm_id);
                
                    if (!vmInfo) {
                        // VM doesn't exist in Lambda AI anymore
                        console.log(`VM ${vm.vm_id}: Not found in Lambda AI, removing from database`);
                        await this.removeVMFromDB(db, vm.vm_id);
                        continue;
                    }
                
                    if (vmInfo.status === 'terminated') {
                        console.log(`VM ${vm.vm_id}: Already terminated, removing from database`);
                        await this.removeVMFromDB(db, vm.vm_id);
                        continue;
                    }
                
                    if (vmInfo.status === 'active') {
                        // Check if VM should be terminated due to idle time
                        if (await this.shouldTerminateVM(db, vm, pendingJobsCount)) {
                            // Check VM health before terminating
                            const isHealthy = await this.checkVMHealth(vm.vm_id, vmInfo.ip);
                            if (!isHealthy) {
                                console.log(`VM ${vm.vm_id}: Unhealthy and idle, terminating`);
                            } else {
                                console.log(`VM ${vm.vm_id}: Healthy but idle beyond timeout, terminating`);
                            }
                        
                            const terminated = await this.terminateVM(vm.vm_id);
                            if (terminated) {
                                await this.removeVMFromDB(db, vm.vm_id);
                            }
                        }
                    }
                } catch (error) {
                    console.error(`Error processing VM ${vm.vm_id} during cleanup:`, error.message);
                }
            }
        } catch (error) {
            console.error('Error in VM cleanup process:', error.message);
        }
    }
    
    // Execute the video processing task on the VM
    async executeTaskOnVM(db, vm_id, match_id, m3u8_link) {
        try {
            const ip = await this.waitForInstanceReady(vm_id);
            const command = `cd FootBall-Analysis-Project && python3 server_main.py --match_id ${match_id} --m3u8_link "${m3u8_link}" --folds "all"`;
        
            console.log(`Executing task on VM ${vm_id} for match ${match_id}`);
            // Update activity timestamp before starting task
            await this.updateVMActivity(db, vm_id);
        
            await new Promise((resolve, reject) => {
                const conn = new Client();
                conn.on('ready', () => {
                    conn.exec(command, (err, stream) => {
                        if (err) {
                            conn.end();
                            return reject(err);
                        }
                    
                        stream.on('close', async (code) => {
                            conn.end();
                            if (code === 0) {
                                console.log(`Task executed successfully on VM ${vm_id}`);
                                await this.markVMFree(db, vm_id);
                                console.log(`VM ${vm_id} marked as free and assigned_match_id cleared`);
                                resolve();
                            } else {
                                console.error(`Task failed on VM ${vm_id} with exit code ${code}`);
                                await this.markVMFree(db, vm_id);
                                reject(new Error(`Command exited with code ${code}`));
                            }
                        })
                        .on('data', (data) => {
                            console.log(`STDOUT: ${data}`);
                        })
                        .stderr.on('data', (data) => {
                            console.error(`STDERR: ${data}`);
                        });
                    });
                })
                .on('error', async (err) => {
                    console.error(`SSH connection error for VM ${vm_id}:`, err.message);
                    await this.markVMFree(db, vm_id);
                    reject(err);
                })
                .connect({
                    host: ip,
                    username: 'ubuntu',
                    privateKey: this.sshPrivateKey,
                    readyTimeout: this.config.sshTimeout
                });
            });
        } catch (error) {
            console.error(`Error executing task on VM ${vm_id}:`, error.message);
            // Ensure VM is marked as free on any error
            try {
                await this.markVMFree(db, vm_id);
            } catch (dbError) {
                console.error(`Error updating VM status after task failure:`, dbError.message);
            }
            throw error;
        }
    }
    
    // Main handler to orchestrate the automation process
    async handler() {
        let db;
        try {
            db = await this.connectToDatabase();
            console.log('Database connected successfully');
        
            // First, cleanup any stale VMs
            await this.cleanupVMs(db);
        
            const jobs = await this.checkPendingJobs(db);
            if (jobs.length === 0) {
                console.log('No pending jobs found.');
                return 'No pending jobs found.';
            }
        
            const { match_id, m3u8_link } = jobs[0];
            console.log(`Processing match ${match_id} with m3u8_link: ${m3u8_link}`);
        
            let vm = await this.findFreeVM(db);
            if (vm) {
                // Found a free VM
                if (vm.assigned_match_id) {
                    // VM has an assigned match, check its status
                    const status = await this.getMatchProcessingStatus(db, vm.assigned_match_id);
                    if (status !== 'cv_ready' && status !== 'cv_processing') {
                        // Previous match is no longer active, reuse this VM
                        console.log(`Reusing VM ${vm.vm_id} for match ${match_id}`);
                        await this.updateVM(db, vm.vm_id, match_id);
                        await this.executeTaskOnVM(db, vm.vm_id, match_id, m3u8_link);
                        return `Assigned match ${match_id} to reused VM ${vm.vm_id} and started task.`;
                    } else {
                        // VM is still processing a valid job, create new VM
                        console.log(`VM ${vm.vm_id} is still processing. Creating new VM for match ${match_id}`);
                        const new_vm_id = await this.createNewVM(db, match_id);
                        await this.executeTaskOnVM(db, new_vm_id, match_id, m3u8_link);
                        return `Created new VM ${new_vm_id} for match ${match_id} and started task.`;
                    }
                } else {
                    // VM is truly free, assign the job
                    console.log(`Assigning match ${match_id} to free VM ${vm.vm_id}`);
                    await this.updateVM(db, vm.vm_id, match_id);
                    await this.executeTaskOnVM(db, vm.vm_id, match_id, m3u8_link);
                    return `Assigned match ${match_id} to free VM ${vm.vm_id} and started task.`;
                }
            } else {
                // No free VMs available, create a new one
                console.log(`No free VMs available. Creating new VM for match ${match_id}`);
                const new_vm_id = await this.createNewVM(db, match_id);
                await this.executeTaskOnVM(db, new_vm_id, match_id, m3u8_link);
                return `Created new VM ${new_vm_id}, assigned match ${match_id}, and started task.`;
            }
        } catch (error) {
            console.error('Error in automation cycle:', error.message);
            throw error;
        } finally {
            if (db) {
                await db.end();
                console.log('Database connection closed');
            }
        }
    }
    
    // Utility method for running cleanup independently
    async runCleanupOnly() {
        let db;
        try {
            db = await this.connectToDatabase();
            console.log('Running VM cleanup process...');
            await this.cleanupVMs(db);
            return 'VM cleanup completed successfully';
        } catch (error) {
            console.error('Error in cleanup process:', error.message);
            throw error;
        } finally {
            if (db) {
                await db.end();
                console.log('Database connection closed');
            }
        }
    }
    
    // Get system statistics
    async getSystemStats() {
        let db;
        try {
            db = await this.connectToDatabase();
            // Get VM statistics
            const [vmStats] = await db.execute(`
                SELECT 
                    COUNT(*) as total_vms,
                    SUM(CASE WHEN is_free = 1 THEN 1 ELSE 0 END) as free_vms,
                    SUM(CASE WHEN is_free = 0 THEN 1 ELSE 0 END) as busy_vms,
                    AVG(TIMESTAMPDIFF(MINUTE, last_activity, NOW())) as avg_idle_minutes
                FROM vms
            `);
            
            // Get job statistics
            const [jobStats] = await db.execute(`
                SELECT 
                    COUNT(CASE WHEN processing_status = 'cv_ready' THEN 1 END) as pending_jobs,
                    COUNT(CASE WHEN processing_status = 'cv_processing' THEN 1 END) as processing_jobs,
                    COUNT(CASE WHEN processing_status = 'completed' THEN 1 END) as completed_jobs
                FROM matches
            `);
            
            return {
                vms: vmStats[0],
                jobs: jobStats[0],
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error getting system stats:', error.message);
            throw error;
        } finally {
            if (db) {
                await db.end();
            }
        }
    }

}
