import pymysql
import json
import os
import uuid
import requests
import time
import paramiko
import boto3
from datetime import datetime, timedelta

# Database configuration
DB_HOST = 'analytics-and-library.cxqeuoaemxbe.ca-central-1.rds.amazonaws.com'
DB_USER = 'admin'
DB_PASSWORD = 'qsCLwrB742VRjyN58ubpKU'
DB_NAME = 'analytics_and_library'

# Lambda Cloud API configuration
LAMBDA_API_KEY = 'secret_amit_0b09f77438444ab4bca61705bb77fa8f.5aLQrpr7saUdzcjI7KYm8IirAXL0LBqg'
SSH_KEY_NAME = 'football-analysis-yolov11-lambda-ssh'
BASE_URL = 'https://cloud.lambda.ai/api/v1/instance-operations'

# SSH Configuration
SSH_PRIVATE_KEY_SECRET_NAME = 'football-ssh-key'
AWS_REGION = os.environ.get('AWS_REGION', 'us-east-1')

# Testing mode flag
TESTING_MODE = os.environ.get('TESTING_MODE', 'False').lower() == 'true'

def log_scenario(scenario_name, details=""):
    """Enhanced logging for different test scenarios"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"\n{'='*60}")
    print(f"[{timestamp}] SCENARIO: {scenario_name}")
    if details:
        print(f"DETAILS: {details}")
    print(f"{'='*60}")

def log_step(step_name, status="INFO", details=""):
    """Log individual steps with status"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    status_symbol = {
        "INFO": "ℹ️",
        "SUCCESS": "✅",
        "WARNING": "⚠️",
        "ERROR": "❌",
        "TESTING": "🧪"
    }.get(status, "📝")

    print(f"[{timestamp}] {status_symbol} {step_name}")
    if details:
        print(f"      └─ {details}")

def get_ssh_private_key():
    """Retrieve SSH private key from AWS Secrets Manager"""
    if TESTING_MODE:
        log_step("SSH Key Retrieval", "TESTING", "Using dummy SSH key for testing")
        return "dummy-ssh-key-for-testing"
    
    if not SSH_PRIVATE_KEY_SECRET_NAME:
        log_step("SSH Key Configuration", "ERROR", "SSH_PRIVATE_KEY_SECRET_NAME not set")
        return None
    
    try:
        secrets_client = boto3.client('secretsmanager', region_name=AWS_REGION)
        response = secrets_client.get_secret_value(SecretId=SSH_PRIVATE_KEY_SECRET_NAME)
        private_key = response['SecretString']
        log_step("SSH Key Retrieval", "SUCCESS", "Private key retrieved from Secrets Manager")
        return private_key
    except Exception as e:
        log_step("SSH Key Retrieval", "ERROR", f"Failed to get private key: {str(e)}")
        return None


def get_vm_ip_address(vm_id, max_retries=5, retry_delay=10):
    """
    Get the IP address of a VM instance with a retry mechanism.
    """
    if TESTING_MODE:
        fake_ip = f"192.168.1.{hash(vm_id) % 254 + 1}"
        log_step("VM IP Retrieval", "TESTING", f"Using fake IP: {fake_ip}")
        return fake_ip
    
    if not LAMBDA_API_KEY:
        log_step("VM IP Retrieval", "ERROR", "API key not available")
        return None
    
    headers = {
        'accept': 'application/json',
        'Authorization': f'Bearer {LAMBDA_API_KEY}'
    }
    
    url = f"https://cloud.lambda.ai/api/v1/instances"  # Changed to list instances
    
    for attempt in range(max_retries):
        log_step("VM IP Retrieval", "INFO", f"Attempt {attempt + 1}/{max_retries} to get IP for {vm_id}")
        
        try:
            response = requests.get(url, headers=headers, timeout=60)
            response.raise_for_status()
            
            data = response.json()

            if 'data' in data and data['data']:
                for instance in data['data']:
                    if instance.get('id') == vm_id:
                        ip_address = instance.get('ip')
                        if ip_address:
                            log_step("VM IP Retrieval", "SUCCESS", f"IP for {vm_id}: {ip_address}")
                            return ip_address
            
            # If VM is not found in the list, or IP is not yet available
            log_step("VM IP Retrieval", "INFO", f"VM {vm_id} not found or IP not ready. Retrying in {retry_delay} seconds...")
            time.sleep(retry_delay)

        except (requests.exceptions.RequestException, json.JSONDecodeError, Exception) as e:
            log_step("VM IP Retrieval", "WARNING", f"Error on attempt {attempt + 1}: {str(e)}. Retrying...")
            time.sleep(retry_delay)

    log_step("VM IP Retrieval", "ERROR", f"Failed to get IP for {vm_id} after {max_retries} attempts.")
    return None

def get_match_details(cursor, match_id):
    """Get match details including S3 link"""
    try:
        sql_get_match = """
            SELECT match_id, s3_link 
            FROM matches 
            WHERE match_id = %s
        """
        cursor.execute(sql_get_match, (match_id,))
        result = cursor.fetchone()
        
        if result:
            match_id, s3_link = result
            log_step("Match Details", "SUCCESS", f"Retrieved details for match {match_id}")
            return {
                'match_id': match_id,
                's3_link': s3_link
            }
        else:
            log_step("Match Details", "ERROR", f"No details found for match {match_id}")
            return None
            
    except Exception as e:
        log_step("Match Details", "ERROR", f"Failed to get match details: {str(e)}")
        return None

def execute_ssh_commands(vm_ip, match_details, private_key_str):
    """Execute setup and processing commands on VM via SSH"""
    if TESTING_MODE:
        log_step("SSH Command Execution", "TESTING", f"Simulating command execution on {vm_ip}")
        commands = get_processing_commands(match_details)
        for i, cmd in enumerate(commands, 1):
            log_step(f"Command {i}", "TESTING", f"SIMULATED: {cmd}")
        return True
    
    if not vm_ip or not match_details or not private_key_str:
        log_step("SSH Prerequisites", "ERROR", "Missing required parameters for SSH")
        return False
    
    ssh_client = None
    try:
        # Create SSH client
        ssh_client = paramiko.SSHClient()
        ssh_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        
        # Load private key
        from io import StringIO
        private_key = paramiko.RSAKey.from_private_key(StringIO(private_key_str))
        
        # Connect to VM
        log_step("SSH Connection", "INFO", f"Connecting to {vm_ip}")
        ssh_client.connect(
            hostname=vm_ip,
            username='ubuntu',  # Default username for Ubuntu instances
            pkey=private_key,
            timeout=30
        )
        log_step("SSH Connection", "SUCCESS", f"Connected to {vm_ip}")
        
        # Get commands to execute
        commands = get_processing_commands(match_details)
        
        # Execute each command
        for i, command in enumerate(commands, 1):
            log_step(f"Executing Command {i}", "INFO", f"Running: {command}")
            
            stdin, stdout, stderr = ssh_client.exec_command(command, timeout=300)
            
            # Wait for command completion
            exit_status = stdout.channel.recv_exit_status()
            
            if exit_status == 0:
                log_step(f"Command {i}", "SUCCESS", "Executed successfully")
                
                # Log output for important commands
                if i <= 3:  # Log output for first 3 setup commands
                    output = stdout.read().decode('utf-8').strip()
                    if output:
                        log_step(f"Command {i} Output", "INFO", output[:200] + "..." if len(output) > 200 else output)
            else:
                error_output = stderr.read().decode('utf-8').strip()
                log_step(f"Command {i}", "ERROR", f"Failed with exit code {exit_status}: {error_output}")
                
                # For critical setup commands, return False
                if i <= 6:  # Setup commands are critical
                    return False
        
        log_step("SSH Command Execution", "SUCCESS", "All commands executed successfully")
        return True
        
    except Exception as e:
        log_step("SSH Command Execution", "ERROR", f"SSH execution failed: {str(e)}")
        return False
        
    finally:
        if ssh_client:
            ssh_client.close()
            log_step("SSH Connection", "INFO", "Connection closed")

def get_processing_commands(match_details):
    """Generate the list of commands to execute on the VM"""
    match_id = match_details['match_id']
    s3_link = match_details['s3_link']
    
    commands = [
        # SSH key generation
        'ssh-keygen -t rsa -f /home/ubuntu/.ssh/id_rsa -N "" -C "test"',
        
        # Display public key (for logging/debugging)
        'cat /home/ubuntu/.ssh/id_rsa.pub',
        
        # Clone repository
        'git clone https://github.com/nadhirhasan/football-DevOps-test.git',
        
        # Navigate to project directory
        'cd football-DevOps-test',
        
        # Checkout specific version
        'cd football-DevOps-test && git checkout tags/v0.0.2 -b v0.0.2-branch',
        
        # Install requirements
        'cd football-DevOps-test && pip install -r requirements.txt',
        
        # Run the main processing script
        f'cd football-DevOps-test && python server_main.py --match_id {match_id} --s3_link {s3_link} --folds "all"'
    ]
    
    return commands

def wait_for_vm_ready(vm_ip, max_wait_minutes=10):
    """Wait for VM to be SSH accessible"""
    if TESTING_MODE:
        log_step("VM Readiness Check", "TESTING", f"Simulating wait for VM {vm_ip}")
        time.sleep(2)
        return True
    
    log_step("VM Readiness Check", "INFO", f"Waiting for VM {vm_ip} to be ready")
    
    start_time = time.time()
    max_wait_seconds = max_wait_minutes * 60
    
    while (time.time() - start_time) < max_wait_seconds:
        try:
            # Try to connect via SSH briefly
            ssh_client = paramiko.SSHClient()
            ssh_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            
            private_key_str = get_ssh_private_key()
            if not private_key_str:
                return False
                
            from io import StringIO
            private_key = paramiko.RSAKey.from_private_key(StringIO(private_key_str))
            
            ssh_client.connect(
                hostname=vm_ip,
                username='ubuntu',
                pkey=private_key,
                timeout=10
            )
            
            # If we get here, connection was successful
            ssh_client.close()
            log_step("VM Readiness Check", "SUCCESS", f"VM {vm_ip} is ready")
            return True
            
        except Exception:
            # VM not ready yet, wait and retry
            time.sleep(30)
            log_step("VM Readiness Check", "INFO", "Still waiting for VM to be ready...")
    
    log_step("VM Readiness Check", "ERROR", f"VM {vm_ip} did not become ready within {max_wait_minutes} minutes")
    return False

def check_configuration():
    """Check and log configuration status"""
    log_step("Configuration Check", "INFO")

    api_key_status = "✅ CONFIGURED" if LAMBDA_API_KEY else "❌ MISSING"
    ssh_key_status = "✅ CONFIGURED" if SSH_KEY_NAME else "❌ MISSING"
    ssh_secret_status = "✅ CONFIGURED" if SSH_PRIVATE_KEY_SECRET_NAME else "❌ MISSING"
    testing_mode_status = "🧪 ENABLED" if TESTING_MODE else "🔴 DISABLED"

    print(f"      ├─ API Key: {api_key_status}")
    print(f"      ├─ SSH Key Name: {ssh_key_status}")
    print(f"      ├─ SSH Private Key Secret: {ssh_secret_status}")
    print(f"      └─ Testing Mode: {testing_mode_status}")

    return bool(LAMBDA_API_KEY), bool(SSH_KEY_NAME), bool(SSH_PRIVATE_KEY_SECRET_NAME)

def terminate_vm_instance(instance_id):
    """
    Terminates a VM instance using the Lambda Cloud API.
    Enhanced with testing mode and detailed logging.
    """
    log_step(f"Terminating VM Instance: {instance_id}", "INFO")

    if TESTING_MODE:
        log_step("API Call Simulation", "TESTING", f"Simulating terminate request for {instance_id}")
        time.sleep(0.5)
        log_step("Terminate Request", "SUCCESS", f"SIMULATED: Instance {instance_id} terminated")
        return True

    if not LAMBDA_API_KEY:
        log_step("API Key Missing", "ERROR", "LAMBDA_CLOUD_API_KEY environment variable not set")
        return False

    headers = {
        'accept': 'application/json',
        'Authorization': f'Bearer {LAMBDA_API_KEY}'
    }

    payload = {
        "instance_ids": [instance_id]
    }

    url = f"{BASE_URL}/terminate"

    try:
        log_step("Sending Terminate Request", "INFO", f"URL: {url}")
        response = requests.post(url, headers=headers, json=payload, timeout=60)
        response.raise_for_status()

        log_step("Terminate Request", "SUCCESS", f"Instance {instance_id} termination requested")
        return True
    except requests.exceptions.RequestException as e:
        log_step("Terminate Request", "ERROR", f"Failed for {instance_id}: {str(e)}")
        return False

def vm_cleanup(cursor):
    """
    Enhanced cleanup function.
    1. Frees up VMs that have completed their processing tasks.
    2. Terminates and deletes VMs that are truly idle (>5 mins) and unassigned.
    """
    log_scenario("VM CLEANUP PROCESS", "Starting cleanup of VMs")

    # --- Phase 1: Free up VMs with completed tasks ---
    log_step("Phase 1", "INFO", "Freeing VMs with completed tasks")
    try:
        sql_find_completed_vms = """
            SELECT vms.vm_id, vms.assigned_match_id
            FROM vms
            JOIN matches ON vms.assigned_match_id = matches.match_id
            WHERE vms.assigned_match_id IS NOT NULL
            AND matches.processing_status = 'cv_processed'
        """
        cursor.execute(sql_find_completed_vms)
        completed_vms = cursor.fetchall()
        
        log_step("Completed VMs Found", "INFO", f"Count: {len(completed_vms)}")
        
        if completed_vms:
            for vm_data in completed_vms:
                vm_id, match_id = vm_data
                log_step("Freeing VM", "INFO", f"VM {vm_id} completed match {match_id}. Setting to free.")
                
                sql_free_vm = """
                    UPDATE vms
                    SET assigned_match_id = NULL, last_activity = %s
                    WHERE vm_id = %s
                """
                cursor.execute(sql_free_vm, (datetime.now(), vm_id))
        else:
            log_step("Freeing VMs", "INFO", "No VMs with completed tasks found.")
            
    except Exception as e:
        log_step("Phase 1", "ERROR", f"Exception during freeing of VMs: {str(e)}")

    # --- Phase 2: Terminate and delete truly idle VMs ---
    log_step("Phase 2", "INFO", "Terminating and deleting truly idle VMs")
    deleted_vms = 0
    try:
        cutoff_time = datetime.now() - timedelta(minutes=5)
        log_step("Setting Cutoff Time", "INFO", f"Cutoff: {cutoff_time.strftime('%Y-%m-%d %H:%M:%S')}")

        sql_find_idle_vms = """
            SELECT vm_id, last_activity
            FROM vms
            WHERE assigned_match_id IS NULL AND last_activity < %s
        """

        log_step("Querying Idle VMs", "INFO", "Searching for VMs idle > 5 minutes")
        cursor.execute(sql_find_idle_vms, (cutoff_time,))
        idle_vms = cursor.fetchall()

        log_step("Idle VMs Found", "INFO", f"Count: {len(idle_vms)}")

        if not idle_vms:
            log_step("No Cleanup Needed", "SUCCESS", "No idle VMs found")
            return 0

        for vm_data in idle_vms:
            vm_id = vm_data[0]
            last_activity = vm_data[1]
            activity_str = last_activity.strftime('%Y-%m-%d %H:%M:%S') if last_activity else "NULL"
            log_step("Processing Idle VM", "INFO", f"ID: {vm_id}, Last Activity: {activity_str}")

            if terminate_vm_instance(vm_id):
                try:
                    sql_delete_vm = "DELETE FROM vms WHERE vm_id = %s"
                    cursor.execute(sql_delete_vm, (vm_id,))
                    deleted_vms += 1
                    log_step("Database Cleanup", "SUCCESS", f"VM {vm_id} deleted from database")
                except Exception as delete_error:
                    log_step("Database Cleanup", "ERROR", f"Failed to delete {vm_id}: {str(delete_error)}")
            else:
                log_step("VM Termination", "WARNING", f"API termination failed for {vm_id}, skipping database deletion")

        log_step("Cleanup Summary", "SUCCESS", f"Terminated and deleted {deleted_vms}/{len(idle_vms)} VMs")
        return deleted_vms

    except Exception as e:
        log_step("Cleanup Process", "ERROR", f"Exception occurred: {str(e)}")
        return deleted_vms

def create_new_vm_instance():
    """
    Launches a new VM instance using the Lambda Cloud API with retry and region fallback.
    """
    log_step("Creating New VM Instance", "INFO")

    has_api_key, has_ssh_key, has_ssh_secret = check_configuration()

    if not has_api_key or not has_ssh_key:
        missing_items = []
        if not has_api_key: missing_items.append("API key")
        if not has_ssh_key: missing_items.append("SSH key name")
        log_step("Configuration Error", "ERROR", f"Missing: {', '.join(missing_items)}")
        return None

    headers = {
        'accept': 'application/json',
        'Authorization': f'Bearer {LAMBDA_API_KEY}'
    }

    regions_to_try = ["us-south-2"]
    list_sku = ["gpu_1x_gh200"]
    max_retries = 1
    retry_delay_seconds = 15

    for region in regions_to_try:
        for attempt in range(max_retries):
            log_step("Sending Launch Request", "INFO", f"Trying region: {region}, Attempt {attempt + 1}/{max_retries}")

            payload = {
                "region_name": region,
                "instance_type_name": "gpu_1x_h100_sxm5",
                "ssh_key_names": [SSH_KEY_NAME],
            }
            url = f"{BASE_URL}/launch"

            if TESTING_MODE:
                log_step("VM Creation Simulation", "TESTING", "Simulating VM launch request")
                fake_instance_id = f"test-vm-{uuid.uuid4().hex[:8]}"
                log_step("VM Launch", "SUCCESS", f"SIMULATED: New instance created with ID: {fake_instance_id}")
                return fake_instance_id

            try:
                response = requests.post(url, headers=headers, json=payload, timeout=120)
                response.raise_for_status()

                response_data = response.json()
                if 'data' in response_data and 'instance_ids' in response_data['data'] and response_data['data']['instance_ids']:
                    new_instance_id = response_data['data']['instance_ids'][0]
                    log_step("VM Launch", "SUCCESS", f"New instance created in {region} with ID: {new_instance_id}")
                    return new_instance_id
                else:
                    log_step("VM Launch", "ERROR", "Unexpected API response structure.")
                    log_step("API Response", "INFO", f"Full response: {response_data}")
                    return None

            except requests.exceptions.RequestException as e:
                if e.response and e.response.status_code == 400 and "insufficient-capacity" in e.response.text:
                    log_step("Insufficient Capacity", "WARNING", f"No capacity in {region}. Retrying in {retry_delay_seconds} seconds...")
                    time.sleep(retry_delay_seconds)
                    continue
                else:
                    log_step("VM Launch", "ERROR", f"API request failed for {region}: {str(e)}")
                    if e.response:
                        log_step("API Response", "ERROR", f"Response content: {e.response.text}")
                    return None
            except Exception as e:
                log_step("VM Launch", "ERROR", f"An unexpected error occurred for {region}: {str(e)}")
                return None

    log_step("VM Launch", "ERROR", "Failed to find an available VM in any of the specified regions after all attempts.")
    return None

def assign_vm_to_match_safely(cursor, vm_id, match_id):
    """
    Safely assign a VM to a match in the database.
    This function commits the assignment immediately to ensure consistency.
    """
    try:
        log_step("VM Assignment", "INFO", f"Assigning VM {vm_id} to match {match_id}")
        
        current_time = datetime.now()
        sql_update_vm = """
            UPDATE vms
            SET assigned_match_id = %s,
                last_activity = %s
            WHERE vm_id = %s
        """
        cursor.execute(sql_update_vm, (match_id, current_time, vm_id))
        
        # Commit the assignment immediately
        cursor.connection.commit()
        
        log_step("VM Assignment", "SUCCESS", f"VM {vm_id} successfully assigned to match {match_id}")
        return True
        
    except Exception as e:
        log_step("VM Assignment", "ERROR", f"Failed to assign VM {vm_id} to match {match_id}: {str(e)}")
        cursor.connection.rollback()
        return False

def free_vm_from_assignment(cursor, vm_id):
    """
    Free a VM from its current assignment.
    Used when processing fails and we need to make the VM available again.
    """
    try:
        log_step("VM Freeing", "INFO", f"Freeing VM {vm_id} from assignment")
        
        current_time = datetime.now()
        sql_free_vm = """
            UPDATE vms
            SET assigned_match_id = NULL,
                last_activity = %s
            WHERE vm_id = %s
        """
        cursor.execute(sql_free_vm, (current_time, vm_id))
        cursor.connection.commit()
        
        log_step("VM Freeing", "SUCCESS", f"VM {vm_id} has been freed")
        return True
        
    except Exception as e:
        log_step("VM Freeing", "ERROR", f"Failed to free VM {vm_id}: {str(e)}")
        return False

def check_database_state(cursor):
    """Check and log current database state for testing"""
    log_step("Database State Check", "INFO", "Checking current VM and match status")

    # Check VMs
    cursor.execute("SELECT vm_id, assigned_match_id, created_at, last_activity FROM vms")
    vms = cursor.fetchall()

    log_step("Current VMs", "INFO", f"Total VMs in database: {len(vms)}")
    for vm in vms:
        vm_id, assigned_match, created_at, last_activity = vm
        status = "BUSY" if assigned_match else "FREE"
        activity_str = last_activity.strftime('%H:%M:%S') if last_activity else "NULL"
        print(f"      ├─ VM {vm_id}: {status}, Assigned Match: {assigned_match}, Activity: {activity_str}")

    # Check matches
    cursor.execute("SELECT match_id, processing_status FROM matches WHERE processing_status IN ('cv_ready', 'cv_processed', 'cv_processeded')")
    matches = cursor.fetchall()

    log_step("Relevant Matches", "INFO", f"Matches ready/processing: {len(matches)}")
    for match in matches:
        match_id, status = match
        print(f"      ├─ Match {match_id}: {status}")

def lambda_handler(event, context):
    """
    REFACTORED Main handler with safer VM assignment logic:
    - Find match and VM first (without assignment)
    - Execute all risky operations (IP retrieval, SSH commands) 
    - ONLY assign VM to match AFTER successful SSH command execution
    - If anything fails, no assignment is made, keeping the match available for retry
    """
    connection = None
    vm_id = None
    match_id_to_process = None
    vm_was_created = False
    
    try:
        log_scenario("LAMBDA HANDLER EXECUTION", "Video processing assignment started")
        check_configuration()

        # DB connect
        log_step("Database Connection", "INFO", f"Connecting to {DB_HOST}")
        connection = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            connect_timeout=10,
            autocommit=False
        )
        connection.ping(reconnect=True)
        log_step("Database Connection", "SUCCESS", "Connected successfully")

        with connection.cursor() as cursor:
            check_database_state(cursor)

            # 1. Find one cv_ready match that is not already assigned to a VM
            log_scenario("MATCH SELECTION PROCESS", "Looking for a match to assign")
            sql_find_ready_match = """
                SELECT m.match_id
                FROM matches m
                WHERE m.processing_status = 'cv_ready'
                AND NOT EXISTS (
                    SELECT 1 FROM vms v WHERE v.assigned_match_id = m.match_id
                )
                LIMIT 1
            """
            cursor.execute(sql_find_ready_match)
            ready_match_row = cursor.fetchone()

            if not ready_match_row:
                log_step("No Unassigned Matches", "INFO", "No new matches to process.")

                # Cleanup phase
                log_step("Starting Cleanup Phase", "INFO", "No work to do, performing cleanup.")
                terminated_count = vm_cleanup(cursor)
                log_step("VM Cleanup", "SUCCESS", f"Terminated and deleted {terminated_count} idle VMs.")

                connection.commit()
                log_scenario("EXECUTION COMPLETE", f"No work to do, cleaned up {terminated_count} idle VMs.")
                return {
                    'statusCode': 200,
                    'body': json.dumps({
                        'message': 'No matches ready for processing. Performed cleanup.',
                        'vms_cleaned_up': terminated_count
                    })
                }

            match_id_to_process = ready_match_row[0]
            log_step("Match Found", "SUCCESS", f"Found unassigned match: {match_id_to_process}")

            # 2. Get match details (this is safe, no state changes)
            match_details = get_match_details(cursor, match_id_to_process)
            if not match_details:
                log_step("Match Details Error", "ERROR", "Could not retrieve match details")
                return {'statusCode': 500, 'body': json.dumps('Failed to retrieve match details')}

            # 3. Find or create a VM (but DON'T assign it yet)
            log_scenario("VM PREPARATION", "Finding or creating VM (without assignment)")
            sql_find_free_vms = """
                SELECT vm_id, last_activity
                FROM vms
                WHERE assigned_match_id IS NULL
                ORDER BY last_activity ASC
                LIMIT 1
            """
            log_step("Querying Free VMs", "INFO", "Searching for an available VM")
            cursor.execute(sql_find_free_vms)
            free_vm = cursor.fetchone()

            if free_vm:
                vm_id = free_vm[0]
                last_activity = free_vm[1]
                activity_str = last_activity.strftime('%Y-%m-%d %H:%M:%S') if last_activity else "NULL"
                log_step("Free VM Found", "SUCCESS", f"Will use VM {vm_id} (Last activity: {activity_str})")
                vm_was_created = False
            else:
                log_step("No Free VMs", "WARNING", "No free VMs available, creating a new one")
                vm_id = create_new_vm_instance()
                if not vm_id:
                    log_step("VM Creation Failed", "ERROR", "Cannot proceed without VM")
                    return {'statusCode': 500, 'body': json.dumps('Failed to create new VM')}
                
                # Add the newly created VM to database (but still not assigned to any match)
                log_step("Adding New VM to Database", "INFO", f"Adding VM {vm_id} to database")
                try:
                    current_time = datetime.now()
                    sql_create_vm = """
                        INSERT INTO vms (vm_id, assigned_match_id, created_at, last_activity)
                        VALUES (%s, NULL, %s, %s)
                    """
                    cursor.execute(sql_create_vm, (vm_id, current_time, current_time))
                    connection.commit()
                    log_step("VM Database Entry", "SUCCESS", f"VM {vm_id} added to database")
                    vm_was_created = True
                except Exception as e:
                    log_step("VM Database Entry", "ERROR", f"Failed to add VM to database: {str(e)}")
                    return {'statusCode': 500, 'body': json.dumps('Failed to add new VM to database')}

        # 4. Execute all risky operations BEFORE assigning VM to match
        log_scenario("RISKY OPERATIONS PHASE", f"Testing VM {vm_id} before assignment")
        
        # 4a. Get VM IP address
        vm_ip = get_vm_ip_address(vm_id)
        if not vm_ip:
            log_step("VM IP Error", "ERROR", "Could not get VM IP address")
            # If we created this VM and it's not working, we should clean it up
            if vm_was_created:
                with connection.cursor() as cleanup_cursor:
                    cleanup_cursor.execute("DELETE FROM vms WHERE vm_id = %s", (vm_id,))
                    connection.commit()
                    log_step("Cleanup Failed VM", "INFO", f"Removed non-functional VM {vm_id} from database")
                    
                    # Also terminate the VM instance
                    terminate_vm_instance(vm_id)
            
            return {'statusCode': 500, 'body': json.dumps('Failed to get VM IP address')}

        # 4b. Wait for VM to be ready for SSH
        if not wait_for_vm_ready(vm_ip):
            log_step("VM Ready Check", "ERROR", "VM did not become ready in time")
            # If we created this VM and it's not working, we should clean it up
            if vm_was_created:
                with connection.cursor() as cleanup_cursor:
                    cleanup_cursor.execute("DELETE FROM vms WHERE vm_id = %s", (vm_id,))
                    connection.commit()
                    log_step("Cleanup Failed VM", "INFO", f"Removed non-responsive VM {vm_id} from database")
                    
                    # Also terminate the VM instance
                    terminate_vm_instance(vm_id)
            
            return {'statusCode': 500, 'body': json.dumps('VM did not become ready for SSH')}

        # 4c. Get SSH private key
        private_key_str = get_ssh_private_key()
        if not private_key_str:
            log_step("SSH Key Error", "ERROR", "Could not retrieve SSH private key")
            # If we created this VM and it's not working, we should clean it up
            if vm_was_created:
                with connection.cursor() as cleanup_cursor:
                    cleanup_cursor.execute("DELETE FROM vms WHERE vm_id = %s", (vm_id,))
                    connection.commit()
                    log_step("Cleanup Failed VM", "INFO", f"Removed VM {vm_id} due to SSH key issue")
                    
                    # Also terminate the VM instance
                    terminate_vm_instance(vm_id)
            
            return {'statusCode': 500, 'body': json.dumps('Failed to retrieve SSH private key')}

        # 4d. Execute SSH commands (the most critical risky operation)
        log_scenario("SSH COMMAND EXECUTION", f"Running processing commands on VM {vm_id}")
        command_success = execute_ssh_commands(vm_ip, match_details, private_key_str)

        if not command_success:
            log_step("Command Execution Failed", "ERROR", "Failed to execute processing commands")
            # If we created this VM and commands failed, we should clean it up
            if vm_was_created:
                with connection.cursor() as cleanup_cursor:
                    cleanup_cursor.execute("DELETE FROM vms WHERE vm_id = %s", (vm_id,))
                    connection.commit()
                    log_step("Cleanup Failed VM", "INFO", f"Removed VM {vm_id} due to command failure")
                    
                    # Also terminate the VM instance
                    terminate_vm_instance(vm_id)
            
            return {'statusCode': 500, 'body': json.dumps('Failed to execute processing commands on VM')}

        # 5. SUCCESS! Now safely assign VM to match (this is the ONLY place we make the assignment)
        log_scenario("SAFE VM ASSIGNMENT", f"All operations successful, now assigning VM {vm_id} to match {match_id_to_process}")
        
        with connection.cursor() as assignment_cursor:
            assignment_success = assign_vm_to_match_safely(assignment_cursor, vm_id, match_id_to_process)
            
            if not assignment_success:
                log_step("Assignment Failed", "ERROR", "Could not assign VM to match in database")
                # At this point, commands are running but assignment failed
                # We should try to stop the processing if possible, but this is a rare edge case
                return {'statusCode': 500, 'body': json.dumps('Failed to assign VM to match in database')}

        log_scenario("EXECUTION COMPLETE", f"Successfully assigned and started processing for match {match_id_to_process} on VM {vm_id}")
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Video processing started successfully',
                'match_assigned': match_id_to_process,
                'vm_used': vm_id,
                'vm_ip': vm_ip,
                'vm_was_created': vm_was_created,
                'commands_executed': True,
                'testing_mode': TESTING_MODE
            })
        }

    except Exception as e:
        log_step("Critical Error", "ERROR", f"Exception in main handler: {str(e)}")
        
        # If we created a VM but something failed, clean it up
        if vm_was_created and vm_id and connection:
            try:
                with connection.cursor() as cleanup_cursor:
                    cleanup_cursor.execute("DELETE FROM vms WHERE vm_id = %s", (vm_id,))
                    connection.commit()
                    log_step("Exception Cleanup", "INFO", f"Cleaned up VM {vm_id} due to exception")
                    
                    # Also terminate the VM instance
                    terminate_vm_instance(vm_id)
            except:
                pass  # Best effort cleanup
        
        return {'statusCode': 500, 'body': json.dumps(f"Error: {str(e)}")}

    finally:
        if connection and connection.open:
            log_step("Cleanup", "INFO", "Closing database connection")
            connection.close()


def vm_processing_complete_handler(event, context):
    """
    Handler called by VM after finishing processing.
    - Marks match as cv_processed
    - Frees up VM
    """
    connection = None
    try:
        log_scenario("VM PROCESSING COMPLETION", "Handling completed processing")

        match_id = event.get('match_id')
        vm_id = event.get('vm_id')
        log_step("Event Parameters", "INFO", f"Match: {match_id}, VM: {vm_id}")

        if not match_id or not vm_id:
            log_step("Parameter Validation", "ERROR", "match_id and vm_id are required")
            raise ValueError("match_id and vm_id are required")

        # DB connect
        connection = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            connect_timeout=10,
            autocommit=False
        )
        connection.ping(reconnect=True)
        log_step("Database Connection", "SUCCESS", "Connected for completion handling")

        with connection.cursor() as cursor:
            check_database_state(cursor)

            # Update match to processed
            log_step("Updating Match Status", "INFO", f"Setting match {match_id} to cv_processed")
            sql_update_match_status = """
                UPDATE matches
                SET processing_status = 'cv_processed',
                    updated_at = %s
                WHERE match_id = %s
            """
            cursor.execute(sql_update_match_status, (datetime.now(), match_id))

            # Free VM
            log_step("Freeing VM", "INFO", f"Setting VM {vm_id} to free status")
            sql_free_vm = """
                UPDATE vms
                SET assigned_match_id = NULL,
                    last_activity = %s
                WHERE vm_id = %s
            """
            cursor.execute(sql_free_vm, (datetime.now(), vm_id))

            connection.commit()
            log_step("Completion Handling", "SUCCESS", f"Processing for match {match_id} completed. VM {vm_id} is now free.")

        log_scenario("COMPLETION HANDLING COMPLETE", f"VM {vm_id} is now free")
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Processing completion handled successfully',
                'match_id': match_id,
                'vm_id': vm_id,
                'testing_mode': TESTING_MODE
            })
        }

    except Exception as e:
        log_step("Completion Error", "ERROR", f"Exception: {str(e)}")
        if connection:
            connection.rollback()
        return {'statusCode': 500, 'body': json.dumps(f"Error: {str(e)}")}

    finally:
        if connection and connection.open:
            connection.close()

if __name__ == '__main__':
    os.environ['TESTING_MODE'] = 'true'

    print("🧪 STARTING COMPREHENSIVE TESTING WITH SAFER VM ASSIGNMENT")
    print("=" * 80)

    # Test 1: Normal assignment with SSH command execution
    log_scenario("TEST 1", "Normal assignment process with safer VM assignment")
    result1 = lambda_handler({}, None)
    print(f"Test 1 Result: {result1}")
