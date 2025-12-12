#!/bin/bash

# EVR Billings Score API Test Script
# This script demonstrates the basic API flow

set -e  # Exit on error

BASE_URL="http://localhost:3000"
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================${NC}"
echo -e "${BLUE}EVR Billings Score API Test${NC}"
echo -e "${BLUE}==================================${NC}\n"

# 1. Health Check
echo -e "${YELLOW}1. Checking server health...${NC}"
HEALTH=$(curl -s $BASE_URL/health)
echo "$HEALTH" | jq '.'

if [ $(echo "$HEALTH" | jq -r '.status') != "healthy" ]; then
  echo -e "${RED}Server is not healthy! Exiting.${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Server is healthy${NC}\n"

# 2. Create Session
echo -e "${YELLOW}2. Creating a new session...${NC}"
SESSION_DATA=$(curl -s -X POST $BASE_URL/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Test Session",
    "facilitatorId": "facilitator-test-123"
  }')

SESSION_ID=$(echo "$SESSION_DATA" | jq -r '.id')
SESSION_CODE=$(echo "$SESSION_DATA" | jq -r '.code')

echo "$SESSION_DATA" | jq '.'
echo -e "${GREEN}✓ Session created${NC}"
echo -e "  Session ID: ${SESSION_ID}"
echo -e "  Session Code: ${SESSION_CODE}\n"

# 3. Get Session by Code
echo -e "${YELLOW}3. Retrieving session by code...${NC}"
curl -s $BASE_URL/api/sessions/$SESSION_CODE | jq '.'
echo -e "${GREEN}✓ Session retrieved${NC}\n"

# 4. Join as Submitter
echo -e "${YELLOW}4. Joining session as submitter (Alice)...${NC}"
ALICE_DATA=$(curl -s -X POST $BASE_URL/api/sessions/$SESSION_ID/join \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Alice",
    "role": "submitter"
  }')

ALICE_ID=$(echo "$ALICE_DATA" | jq -r '.id')
echo "$ALICE_DATA" | jq '.'
echo -e "${GREEN}✓ Alice joined as submitter${NC}"
echo -e "  Participant ID: ${ALICE_ID}\n"

# 5. Join as Voter 1
echo -e "${YELLOW}5. Joining session as voter (Bob)...${NC}"
BOB_DATA=$(curl -s -X POST $BASE_URL/api/sessions/$SESSION_ID/join \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Bob",
    "role": "voter"
  }')

BOB_ID=$(echo "$BOB_DATA" | jq -r '.id')
echo "$BOB_DATA" | jq '.'
echo -e "${GREEN}✓ Bob joined as voter${NC}\n"

# 6. Join as Voter 2
echo -e "${YELLOW}6. Joining session as voter (Charlie)...${NC}"
CHARLIE_DATA=$(curl -s -X POST $BASE_URL/api/sessions/$SESSION_ID/join \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Charlie",
    "role": "voter"
  }')

CHARLIE_ID=$(echo "$CHARLIE_DATA" | jq -r '.id')
echo "$CHARLIE_DATA" | jq '.'
echo -e "${GREEN}✓ Charlie joined as voter${NC}\n"

# 7. List All Participants
echo -e "${YELLOW}7. Listing all participants...${NC}"
PARTICIPANTS=$(curl -s "$BASE_URL/api/participants/session/$SESSION_ID?activeOnly=true")
echo "$PARTICIPANTS" | jq '.'
PARTICIPANT_COUNT=$(echo "$PARTICIPANTS" | jq 'length')
echo -e "${GREEN}✓ Found $PARTICIPANT_COUNT active participants${NC}\n"

# 8. Update Alice's Score
echo -e "${YELLOW}8. Updating Alice's Billings Score...${NC}"
ALICE_UPDATED=$(curl -s -X POST $BASE_URL/api/participants/$ALICE_ID/score \
  -H "Content-Type: application/json" \
  -d '{
    "newScore": 0.6,
    "round": 1,
    "reason": "Submitted a great suggestion"
  }')

echo "$ALICE_UPDATED" | jq '.'
NEW_SCORE=$(echo "$ALICE_UPDATED" | jq -r '.billingsScore')
echo -e "${GREEN}✓ Alice's score updated to $NEW_SCORE${NC}\n"

# 9. Start the Session
echo -e "${YELLOW}9. Starting the session...${NC}"
SESSION_STARTED=$(curl -s -X POST $BASE_URL/api/sessions/$SESSION_ID/start)
echo "$SESSION_STARTED" | jq '.'
SESSION_STATUS=$(echo "$SESSION_STARTED" | jq -r '.status')
echo -e "${GREEN}✓ Session started (status: $SESSION_STATUS)${NC}\n"

# 10. Get Final Session State
echo -e "${YELLOW}10. Getting final session state...${NC}"
FINAL_SESSION=$(curl -s $BASE_URL/api/sessions/id/$SESSION_ID)
echo "$FINAL_SESSION" | jq '.'
echo -e "${GREEN}✓ Final session retrieved${NC}\n"

# Summary
echo -e "${BLUE}==================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}==================================${NC}"
echo -e "Session ID: ${SESSION_ID}"
echo -e "Session Code: ${SESSION_CODE}"
echo -e "Participants: $PARTICIPANT_COUNT"
echo -e "  - Alice (Submitter): $ALICE_ID"
echo -e "  - Bob (Voter): $BOB_ID"
echo -e "  - Charlie (Voter): $CHARLIE_ID"
echo -e "Session Status: $SESSION_STATUS"
echo -e "${GREEN}\nAll tests passed successfully!${NC}\n"
