#!/bin/bash
# test_endpoints.sh
# A quick script to test the basics of the backend endpoints locally

SERVER="http://localhost:5000"

echo "1. Registering Promoter..."
curl -X POST $SERVER/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email": "test@promoter.com", "password": "password123", "role": "promoter", "phone_number": "123456789", "whatsapp_number": "123456789"}'

echo -e "\n\n2. Registering Investor..."
curl -X POST $SERVER/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email": "test@investor.com", "password": "password123", "role": "investor"}'

echo -e "\n\n3. Logging in as Promoter..."
TOKEN=$(curl -s -X POST $SERVER/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "test@promoter.com", "password": "password123"}' | grep -o '"access_token": *"[^"]*"' | grep -o '"[^"]*"$' | tr -d '"')

echo "Token format check: ${TOKEN:0:15}..."
echo -e "\n\n4. Submitting Project (Promoter)..."
# Create dummy files
echo "dummy file" > pitch.pdf
echo "dummy file" > financials.pdf

curl -X POST $SERVER/api/projects/submit \
     -H "Authorization: Bearer $TOKEN" \
     -F "title=AI Startup" \
     -F "company_name=Test Inc" \
     -F "industry=Tech" \
     -F "funding_amount=500k" \
     -F "stage=MVP" \
     -F "pitch_deck=@pitch.pdf" \
     -F "financials=@financials.pdf"

echo -e "\n\n5. Getting Investor Feed..."
curl -X GET $SERVER/api/projects/feed

rm pitch.pdf financials.pdf
echo -e "\n\nTests Finished. Ensure server is running."
