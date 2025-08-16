# Full details of document text like PAN, Adhaar etc

import os
from dotenv import load_dotenv
from azure.core.credentials import AzureKeyCredential
from azure.ai.documentintelligence import DocumentIntelligenceClient

# Load environment variables
load_dotenv()

# Setup
endpoint = os.environ["DOCUMENTINTELLIGENCE_ENDPOINT"]
key = os.environ["DOCUMENTINTELLIGENCE_API_KEY"]

document_intelligence_client = DocumentIntelligenceClient(
    endpoint=endpoint,
    credential=AzureKeyCredential(key)
)

# Path to your ID document (e.g., DL.jpg, PAN.png)
path_to_sample_documents = "DL.jpg"  # Update if needed

# Read the file
with open(path_to_sample_documents, "rb") as f:
    poller = document_intelligence_client.begin_analyze_document("prebuilt-idDocument", body=f)
    result = poller.result()

# Extract and display structured fields
print("------ Extracted Fields from ID Document ------")
if result.documents:
    for doc in result.documents:
        for field_name, field in doc.fields.items():
            content = field.content if field.content else "N/A"
            confidence = field.confidence
            print(f"{field_name}: {content} (Confidence: {confidence:.2f})")
else:
    print("No document was extracted. Check the image quality and model compatibility.")
