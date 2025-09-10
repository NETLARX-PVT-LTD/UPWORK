import pymysql
import json
import os
import uuid
import requests
import time
from datetime import datetime, timedelta

# Database configuration.
DB_HOST = 'analytics-and-library.cxqeuoaemxbe.ca-central-1.rds.amazonaws.com'
DB_USER = 'admin'
DB_PASSWORD = 'qsCLwrB742VRjyN58ubpKU'
DB_NAME = 'analytics_and_library'

# Lambda Cloud API configuration
# IMPORTANT: Store your API key and SSH key name in Lambda's environment variables
# You can do this in the AWS Lambda console under 'Configuration' -> 'Environment variables'
LAMBDA_API_KEY = os.environ.get('LAMBDA_CLOUD_API_KEY')
SSH_KEY_NAME = os.environ.get('LAMBDA_SSH_KEY_NAME')
BASE_URL = 'https://cloud.lambda.ai/api/v1/instance-operations'

# Testing mode flag - set to True for testing without actual API calls
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
        print(f"     └─ {details}")


def check_configuration():
    """Check and log configuration status"""
    log_step("Configuration Check", "INFO")

    api_key_status = "✅ CONFIGURED" if LAMBDA_API_KEY else "❌ MISSING"
    ssh_key_status = "✅ CONFIGURED" if SSH_KEY_NAME else "❌ MISSING"
    testing_mode_status = "🧪 ENABLED" if TESTING_MODE else "🔴 DISABLED"

    print(f"     ├─ API Key: {api_key_status}")
    print(f"     ├─ SSH Key: {ssh_key_status}")
    print(f"     └─ Testing Mode: {testing_mode_status}")

    # Add this log to check the actual value
    log_step("API Key Check", "INFO", f"Retrieved API Key: {LAMBDA_API_KEY is not None}")
    if not LAMBDA_API_KEY:
        log_step("API Key Detail", "ERROR", "LAMBDA_CLOUD_API_KEY is not set. Please ensure it's configured as an environment variable in Lambda and for local testing.")
        
    return bool(LAMBDA_API_KEY), bool(SSH_KEY_NAME)


def terminate_vm_instance(instance_id):
    """
    Terminates a VM instance using the Lambda Cloud API.
    Enhanced with testing mode and detailed logging.
    """
    log_step(f"Terminating VM Instance: {instance_id}", "INFO")

    if TESTING_MODE:
        log_step("API Call Simulation", "TESTING", f"Simulating terminate request for {instance_id}")
        # Simulate API response time
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
    Clean up VMs that have been idle for more than 5 minutes
    Enhanced with detailed logging for testing
    """
    log_scenario("VM CLEANUP PROCESS", "Cleaning up idle VMs (>5 minutes)")

    try:
        # Find VMs that are free and idle for more than 5 minutes
        cutoff_time = datetime.now() - timedelta(minutes=5)
        log_step("Setting Cutoff Time", "INFO", f"Cutoff: {cutoff_time.strftime('%Y-%m-%d %H:%M:%S')}")

        sql_find_idle_vms = """
            SELECT vm_id, last_activity
            FROM vms
            WHERE is_free = 1
            AND (last_activity IS NULL OR last_activity < %s)
        """

        log_step("Querying Idle VMs", "INFO", "Searching for VMs idle > 5 minutes")
        cursor.execute(sql_find_idle_vms, (cutoff_time,))
        idle_vms = cursor.fetchall()

        log_step("Idle VMs Found", "INFO", f"Count: {len(idle_vms)}")

        if not idle_vms:
            log_step("No Cleanup Needed", "SUCCESS", "No idle VMs found")
            return 0

        # Log details of idle VMs
        for i, vm_data in enumerate(idle_vms, 1):
            vm_id = vm_data[0]
            last_activity = vm_data[1]
            activity_str = last_activity.strftime('%Y-%m-%d %H:%M:%S') if last_activity else "NULL"
            log_step(f"Idle VM #{i}", "INFO", f"ID: {vm_id}, Last Activity: {activity_str}")

        deleted_vms = 0
        for vm_data in idle_vms:
            vm_id = vm_data[0]

            log_step(f"Processing VM: {vm_id}", "INFO", "Attempting termination")

            if terminate_vm_instance(vm_id):
                try:
                    # If API call is successful, delete the VM from the database
                    sql_delete_vm = "DELETE FROM vms WHERE vm_id = %s"
                    cursor.execute(sql_delete_vm, (vm_id,))
                    deleted_vms += 1
                    log_step(f"Database Cleanup", "SUCCESS", f"VM {vm_id} deleted from database")
                except Exception as delete_error:
                    log_step(f"Database Cleanup", "ERROR", f"Failed to delete {vm_id}: {str(delete_error)}")
            else:
                log_step(f"VM Termination", "WARNING", f"API termination failed for {vm_id}, skipping database deletion")

        log_step("Cleanup Summary", "SUCCESS", f"Terminated and deleted {deleted_vms}/{len(idle_vms)} VMs")
        return deleted_vms

    except Exception as e:
        log_step("Cleanup Process", "ERROR", f"Exception occurred: {str(e)}")
        return 0


def create_new_vm_instance():
    """
    Launches a new VM instance using the Lambda Cloud API with retry and region fallback.
    """
    log_step("Creating New VM Instance", "INFO")
    
    has_api_key, has_ssh_key = check_configuration()
    
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

    # List of regions to try, in order of preference
    regions_to_try = ["us-south-2", "us-east-1", "us-east-2"]
    
    # Retry logic
    max_retries = 3
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
                # Check for "insufficient-capacity" error
                if e.response and e.response.status_code == 400 and "insufficient-capacity" in e.response.text:
                    log_step("Insufficient Capacity", "WARNING", f"No capacity in {region}. Retrying in {retry_delay_seconds} seconds...")
                    time.sleep(retry_delay_seconds)
                    continue # Continue to the next attempt in the current region
                else:
                    log_step("VM Launch", "ERROR", f"API request failed for {region}: {str(e)}")
                    if e.response:
                        log_step("API Response", "ERROR", f"Response content: {e.response.text}")
                    return None # Exit function on non-capacity errors
            except Exception as e:
                log_step("VM Launch", "ERROR", f"An unexpected error occurred for {region}: {str(e)}")
                return None # Exit function on unexpected errors

    log_step("VM Launch", "ERROR", "Failed to find an available VM in any of the specified regions after all attempts.")
    return None


def create_new_vm(cursor):
    """
    Create a new VM when no free VMs are available
    Enhanced with detailed logging
    """
    log_scenario("NEW VM CREATION", "No free VMs available, creating new one")

    try:
        # 1. Call the API to actually create the VM instance
        new_vm_id = create_new_vm_instance()
        if not new_vm_id:
            log_step("VM Creation", "ERROR", "Failed to create new VM instance")
            return None

        # 2. Insert the new VM into your database with the instance ID
        log_step("Database Insert", "INFO", f"Adding VM {new_vm_id} to database")

        sql_create_vm = """
            INSERT INTO vms (vm_id, is_free, created_at, last_activity)
            VALUES (%s, %s, %s, %s)
        """
        current_time = datetime.now()
        cursor.execute(sql_create_vm, (new_vm_id, 1, current_time, current_time))

        log_step("VM Creation Complete", "SUCCESS", f"VM {new_vm_id} created and added to database")
        return new_vm_id

    except Exception as e:
        log_step("VM Creation", "ERROR", f"Exception during creation: {str(e)}")
        return None


def check_database_state(cursor):
    """Check and log current database state for testing"""
    log_step("Database State Check", "INFO", "Checking current VM and match status")

    # Check VMs
    cursor.execute("SELECT vm_id, is_free, assigned_match_id, created_at, last_activity FROM vms")
    vms = cursor.fetchall()

    log_step("Current VMs", "INFO", f"Total VMs in database: {len(vms)}")
    for vm in vms:
        vm_id, is_free, assigned_match, created_at, last_activity = vm
        status = "FREE" if is_free else "BUSY"
        activity_str = last_activity.strftime('%H:%M:%S') if last_activity else "NULL"
        print(f"     ├─ VM {vm_id}: {status}, {assigned_match}, Activity: {activity_str}")

    # Check matches
    cursor.execute("SELECT match_id, processing_status, assigned_vm FROM matches WHERE processing_status IN ('cv_ready', 'cv_processed')")
    matches = cursor.fetchall()

    log_step("Relevant Matches", "INFO", f"Matches ready/processing: {len(matches)}")
    for match in matches:
        match_id, status, assigned_vm = match
        vm_str = f"VM: {assigned_vm}" if assigned_vm else "No VM"
        print(f"     ├─ Match {match_id}: {status}, {vm_str}")


def free_processed_vms(cursor):
    """
    Finds VMs that are assigned to a completed match (cv_processeded)
    and sets them to free.
    """
    log_scenario("FREEING PROCESSED VMS", "Freeing VMs assigned to processed matches.")
    
    # Find all VMs that are assigned to a match with 'cv_processeded' status
    sql_find_vms_to_free = """
        SELECT v.vm_id
        FROM vms v
        JOIN matches m ON v.assigned_match_id = m.match_id
        WHERE v.is_free = 0 AND m.processing_status = 'cv_processed'
    """
    cursor.execute(sql_find_vms_to_free)
    vms_to_free = cursor.fetchall()
    
    if not vms_to_free:
        log_step("No VMs to free", "SUCCESS", "No VMs found assigned to processed matches.")
        return 0
    
    freed_count = 0
    for vm_data in vms_to_free:
        vm_id = vm_data[0]
        log_step("Freeing VM", "INFO", f"Freeing VM {vm_id} from processed match.")
        
        sql_free_vm = """
            UPDATE vms
            SET is_free = 1,
                assigned_match_id = NULL,
                last_activity = %s
            WHERE vm_id = %s
        """
        cursor.execute(sql_free_vm, (datetime.now(), vm_id))
        freed_count += 1
        
    log_step("VM Freeing Complete", "SUCCESS", f"Freed up {freed_count} VMs.")
    return freed_count


def lambda_handler(event, context):
    """
    Main handler with a logic flow that prioritizes assigning work.
    Only runs VM cleanup if no new work is found.
    """
    connection = None
    try:
        log_scenario("LAMBDA HANDLER EXECUTION", "Video processing assignment started")

        # Check configuration at startup
        check_configuration()

        # Connect to MySQL database
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
            # Check initial database state
            check_database_state(cursor)

            # 1. Find matches that are ready for CV processing
            log_scenario("MATCH ASSIGNMENT PROCESS", "Looking for matches ready for processing")

            sql_find_ready_matches = """
                SELECT match_id, video_path, league_id, season_id, home_team_id, away_team_id, m3u8_link
                FROM matches
                WHERE processing_status = 'cv_ready'
                ORDER BY created_at ASC
                LIMIT 1
            """

            log_step("Querying Ready Matches", "INFO", "Looking for matches with cv_ready status")
            cursor.execute(sql_find_ready_matches)
            ready_matches = cursor.fetchall()

            if ready_matches:
                # 2. A cv_ready record was found, proceed with assignment
                match_data = ready_matches[0]
                match_id = match_data[0]
                video_path = match_data[1]
                log_step("Match Found", "SUCCESS", f"Match ID: {match_id}, Video: {video_path}")

                # 3. Find an available VM
                log_scenario("VM AVAILABILITY CHECK", "Looking for free VMs")
                sql_find_free_vms = """
                    SELECT vm_id, last_activity
                    FROM vms
                    WHERE is_free = 1
                    ORDER BY last_activity ASC
                    LIMIT 1
                """

                log_step("Querying Free VMs", "INFO", "Searching for an available VM")
                cursor.execute(sql_find_free_vms)
                free_vms = cursor.fetchall()

                vm_id = None
                if free_vms:
                    # 4a. A free VM exists, use it
                    vm_id = free_vms[0][0]
                    last_activity = free_vms[0][1]
                    activity_str = last_activity.strftime('%Y-%m-%d %H:%M:%S') if last_activity else "NULL"
                    log_step("Free VM Found", "SUCCESS", f"Using existing VM: {vm_id} (Last activity: {activity_str})")
                else:
                    # 4b. No free VM, create a new one
                    log_step("No Free VMs", "WARNING", "No free VMs available, creating a new one")
                    new_vm_id = create_new_vm(cursor)
                    if new_vm_id:
                        vm_id = new_vm_id
                        log_step("New VM Ready", "SUCCESS", f"Created and will use: {new_vm_id}")
                    else:
                        log_step("VM Creation Failed", "ERROR", "Cannot proceed without VM")
                        connection.rollback()
                        return {
                            'statusCode': 500,
                            'body': json.dumps('Failed to create new VM')
                        }

                # 5. Assign the match to the chosen VM and update status
                log_scenario("MATCH-VM ASSIGNMENT", f"Assigning Match {match_id} to VM {vm_id}")
                current_time = datetime.now()

                # Update match with VM assignment and change status to cv_processed
                log_step("Updating Match", "INFO", f"Setting match {match_id} to cv_processed status")
                sql_assign_match = """
                    UPDATE matches
                    SET assigned_vm = %s,
                        processing_status = 'cv_processed',
                        updated_at = %s
                    WHERE match_id = %s
                """
                cursor.execute(sql_assign_match, (vm_id, current_time, match_id))

                # Mark VM as busy and update last_activity
                log_step("Updating VM Status", "INFO", f"Setting VM {vm_id} to busy")
                sql_update_vm = """
                    UPDATE vms
                    SET is_free = 0,
                        assigned_match_id = %s,
                        last_activity = %s
                    WHERE vm_id = %s
                """
                cursor.execute(sql_update_vm, (match_id, current_time, vm_id))

                log_step("Assignment Complete", "SUCCESS", f"Match {match_id} assigned to VM {vm_id}")
                connection.commit()
                log_step("Database Commit", "SUCCESS", "All changes saved")
                log_scenario("EXECUTION COMPLETE", f"Successfully assigned match {match_id} to VM {vm_id}")

                return {
                    'statusCode': 200,
                    'body': json.dumps({
                        'message': 'Video processing assignment completed successfully',
                        'match_assigned': match_id,
                        'vm_used': vm_id,
                        'vms_cleaned_up': 0, # Cleanup did not run in this flow
                        'testing_mode': TESTING_MODE
                    })
                }

            else:
                # 6. No cv_ready records were found, proceed with cleanup
                log_step("No Matches Found", "WARNING", "No matches ready for processing")
                log_step("Starting Cleanup Phase", "INFO", "No work to do, performing cleanup.")

                # 5. Free up VMs from processed matches
                freed_count = free_processed_vms(cursor)
                log_step("VM Status Update", "SUCCESS", f"Freed up {freed_count} VMs from processed matches.")

                # 6. Terminate truly idle VMs
                terminated_count = vm_cleanup(cursor)
                log_step("VM Cleanup", "SUCCESS", f"Terminated and deleted {terminated_count} truly idle VMs.")

                connection.commit()
                log_scenario("EXECUTION COMPLETE", f"No work to do, freed {freed_count} VMs and cleaned up {terminated_count} idle VMs.")

                return {
                    'statusCode': 200,
                    'body': json.dumps({
                        'message': 'No matches ready for processing. Performed cleanup and freed up processed VMs.',
                        'vms_freed': freed_count,
                        'vms_cleaned_up': terminated_count
                    })
                }

    except Exception as e:
        log_step("Critical Error", "ERROR", f"Exception in main handler: {str(e)}")
        if connection:
            connection.rollback()
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error: {str(e)}")
        }

    finally:
        if connection and connection.open:
            log_step("Cleanup", "INFO", "Closing database connection")
            connection.close()


def vm_processing_complete_handler(event, context):
    """
    Function to handle when VM completes processing
    Enhanced with detailed logging
    """
    connection = None
    try:
        log_scenario("VM PROCESSING COMPLETION", "Handling completed processing")

        # Extract match_id and vm_id from event
        match_id = event.get('match_id')
        vm_id = event.get('vm_id')

        log_step("Event Parameters", "INFO", f"Match: {match_id}, VM: {vm_id}")

        if not match_id or not vm_id:
            log_step("Parameter Validation", "ERROR", "match_id and vm_id are required")
            raise ValueError("match_id and vm_id are required")

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
            # Check current state
            check_database_state(cursor)

            # Update match status to cv_processeded
            log_step("Updating Match Status", "INFO", f"Setting match {match_id} to cv_processeded")
            sql_update_match = """
                UPDATE matches
                SET processing_status = 'cv_processeded',
                    updated_at = %s
                WHERE match_id = %s AND assigned_vm = %s
            """
            cursor.execute(sql_update_match, (datetime.now(), match_id, vm_id))

            # Free up the VM and update last_activity
            log_step("Freeing VM", "INFO", f"Setting VM {vm_id} to free status")
            sql_free_vm = """
                UPDATE vms
                SET is_free = 1,
                    assigned_match_id = NULL,
                    last_activity = %s
                WHERE vm_id = %s
            """
            cursor.execute(sql_free_vm, (datetime.now(), vm_id))

            connection.commit()
            log_step("Completion Handling", "SUCCESS", f"Match {match_id} processing completed on VM {vm_id}")

            # Final state check
            check_database_state(cursor)

        log_scenario("COMPLETION HANDLING COMPLETE", f"VM {vm_id} is now free")

        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Processing completion handled successfully',
                'vms_cleaned_up': 0, # This handler does not do cleanup
                'testing_mode': TESTING_MODE
            })
        }

    except Exception as e:
        log_step("Completion Error", "ERROR", f"Exception: {str(e)}")
        if connection:
            connection.rollback()
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error: {str(e)}")
        }

    finally:
        if connection and connection.open:
            connection.close()


def create_test_scenario_data(cursor):
    """Create test data for different scenarios"""
    log_scenario("TEST DATA SETUP", "Creating test data for different scenarios")

    current_time = datetime.now()
    old_time = current_time - timedelta(minutes=10)

    try:
        # Clean up existing test data
        cursor.execute("DELETE FROM matches WHERE match_id LIKE 'test-%'")
        cursor.execute("DELETE FROM vms WHERE vm_id LIKE 'test-%'")

        # Scenario 1: Free VM available
        cursor.execute("""
            INSERT INTO vms (vm_id, is_free, created_at, last_activity)
            VALUES ('test-vm-free', 1, %s, %s)
        """, (current_time, current_time))

        # Scenario 2: Old idle VM that should be cleaned up
        cursor.execute("""
            INSERT INTO vms (vm_id, is_free, created_at, last_activity)
            VALUES ('test-vm-idle', 1, %s, %s)
        """, (old_time, old_time))

        # Scenario 3: Busy VM
        cursor.execute("""
            INSERT INTO vms (vm_id, is_free, created_at, last_activity, assigned_match_id)
            VALUES ('test-vm-busy', 0, %s, %s, 'test-match-busy')
        """, (current_time, current_time))

        # Test matches
        cursor.execute("""
            INSERT INTO matches (match_id, video_path, processing_status, created_at)
            VALUES ('test-match-ready', '/path/to/test/video.mp4', 'cv_ready', %s)
        """, (current_time,))
        
        # Test match for completion handler
        cursor.execute("""
            INSERT INTO matches (match_id, video_path, processing_status, assigned_vm, created_at)
            VALUES ('test-match-complete', '/path/to/completion/video.mp4', 'cv_processed', 'test-vm-complete', %s)
        """, (current_time,))
        
        # Test VM for completion handler
        cursor.execute("""
            INSERT INTO vms (vm_id, is_free, created_at, last_activity, assigned_match_id)
            VALUES ('test-vm-complete', 0, %s, %s, 'test-match-complete')
        """, (current_time, current_time))

        log_step("Test Data Created", "SUCCESS", "All test scenarios data inserted")

    except Exception as e:
        log_step("Test Data Creation", "ERROR", f"Failed: {str(e)}")


# Enhanced testing functions
def test_scenario_free_vm():
    """Test scenario when free VM is available"""
    log_scenario("TEST: FREE VM AVAILABLE", "Testing assignment with existing free VM")
    os.environ['TESTING_MODE'] = 'true'
    result = lambda_handler({}, None)
    return result


def test_scenario_no_free_vm():
    """Test scenario when no free VM is available"""
    log_scenario("TEST: NO FREE VM", "Testing new VM creation scenario")
    # This would require temporarily removing free VMs from database
    os.environ['TESTING_MODE'] = 'true'
    result = lambda_handler({}, None)
    return result


def test_scenario_completion():
    """Test VM processing completion"""
    log_scenario("TEST: PROCESSING COMPLETION", "Testing completion handler")
    os.environ['TESTING_MODE'] = 'true'

    test_event = {
        'match_id': 'test-match-complete',
        'vm_id': 'test-vm-complete'
    }
    result = vm_processing_complete_handler(test_event, None)
    return result
    
def test_scenario_cleanup():
    """Test VM cleanup when an idle VM exists"""
    log_scenario("TEST: VM CLEANUP", "Testing VM termination for an idle VM")
    os.environ['TESTING_MODE'] = 'true'
    result = lambda_handler({}, None)
    return result


# For local testing
if __name__ == '__main__':
    # Enable testing mode for local testing
    os.environ['TESTING_MODE'] = 'true'

    print("🧪 STARTING COMPREHENSIVE TESTING")
    print("=" * 80)

    # Test 1: Normal assignment
    log_scenario("TEST 1", "Normal assignment process")
    result1 = lambda_handler({}, None)
    print(f"Result: {result1}")

    print("\n" + "=" * 80)

    # Test 2: Completion handler
    log_scenario("TEST 2", "Processing completion")
    completion_event = {
        'match_id': 'test-match-16',
        'vm_id': 'test-vm-001'
    }
    result2 = vm_processing_complete_handler(completion_event, None)
    print(f"Result: {result2}")

    print("\n" + "=" * 80)
    
    # Test 3: Cleanup handler for an idle VM
    log_scenario("TEST 3", "VM cleanup test for an idle VM")
    result3 = test_scenario_cleanup()
    print(f"Result: {result3}")

    print("\n🧪 TESTING COMPLETE")
