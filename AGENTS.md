## APIs

## API Endpoints

### 1. GET `/api/questions?type=pretest`

**Description:** Fetch all pretest questions with their options

**Query Parameters:**
- `type=pretest` (required)

**Response:**
```json
{
  "message": "Successfully fetch questions",
  "data": {
    "questions": [
      {
        "id": 1,
        "type": "pretest",
        "chapter_id": 1,
        "image_link": "https://example.com/image.jpg",
        "description": "Basic algebra question",
        "question": "What is 2 + 2?",
        "options": [
          {
            "id": 1,
            "text": "3"
          },
          {
            "id": 2,
            "text": "4"
          },
          {
            "id": 3,
            "text": "5"
          },
          {
            "id": 4,
            "text": "6"
          }
        ]
      }
    ]
  }
}
```

**Implementation Notes:**
- Fetch all questions where `type = 'pretest'`
- Include all options for each question (do NOT include `isCorrect` field in response)
- Order questions by chapter_id, then by id

---

### 2. POST `/api/pretest`

**Description:** Submit user's pretest answers and calculate results

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "pretest_submissions": [
    {
      "question_id": 1,
      "answered_option_id": 2
    },
    {
      "question_id": 2,
      "answered_option_id": 5
    }
  ]
}
```

**Response:**
```json
{
  "message": "Successfully judged user pretest submission",
  "data": {
    "total_questions": 10,
    "correct_answers": 7,
    "incorrect_answers": 3,
    "score_percentage": 70,
    "chapter_weaknesses": [
      {
        "chapter_id": 1,
        "chapter_title": "Basic Algebra",
        "wrong_count": 2,
        "total_questions": 3
      },
      {
        "chapter_id": 3,
        "chapter_title": "Geometry",
        "wrong_count": 1,
        "total_questions": 2
      }
    ]
  }
}
```

**Implementation Logic:**

1. **Validate user authentication** from Bearer token
2. **Validate all question_ids** exist and are pretest type
3. **For each submission:**
   - Fetch the correct option for the question
   - Compare `answered_option_id` with the correct option
   - Determine if answer is correct
4. **Save to database:**
   - Insert each answer into `pretest_submissions` table
   - Store: userId, questionId, answeredOptionId, isCorrect
5. **Calculate chapter weaknesses:**
   - Group incorrect answers by chapter_id
   - Count wrong answers per chapter
   - Return chapters sorted by wrong_count (descending)

**Error Responses:**
```json
{
  "success": false,
  "error": "Invalid question_id: 999"
}
```

```json
{
  "success": false,
  "error": "User has already submitted pretest"
}
```

---

### 3. GET `/api/chapters`

**Description:** Fetch chapters sorted by user's pretest performance (weakest first)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Successfully fetch chapters by user's preference",
  "data": {
    "has_taken_pretest": true,
    "chapters": [
      {
        "id": 1,
        "title": "Basic Algebra",
        "description": "Learn fundamental algebraic concepts",
        "mascot_id": 1,
        "user_performance": {
          "wrong_answers": 2,
          "total_pretest_questions": 3,
          "accuracy_percentage": 33.33
        },
        "quiz_count": 5,
        "completed_quizzes": 0
      },
      {
        "id": 3,
        "title": "Geometry",
        "description": "Introduction to shapes and spatial reasoning",
        "mascot_id": 3,
        "user_performance": {
          "wrong_answers": 1,
          "total_pretest_questions": 2,
          "accuracy_percentage": 50
        },
        "quiz_count": 3,
        "completed_quizzes": 0
      },
      {
        "id": 2,
        "title": "Statistics",
        "description": "Data analysis and probability",
        "mascot_id": 2,
        "user_performance": {
          "wrong_answers": 0,
          "total_pretest_questions": 5,
          "accuracy_percentage": 100
        },
        "quiz_count": 4,
        "completed_quizzes": 2
      }
    ]
  }
}
```

**Implementation Logic:**

1. **Validate user authentication** from Bearer token
2. **Check if user has taken pretest:**
   - Query `pretest_submissions` for userId
   - If no submissions exist, return chapters in default order with `has_taken_pretest: false`
3. **If user has taken pretest:**
   - Fetch all chapters
   - For each chapter, calculate:
     - Total wrong answers from pretest (join pretest_submissions with questions)
     - Total pretest questions for that chapter
     - Accuracy percentage
   - **Sorting priority:**
     - Primary: Chapters with wrong answers (most wrong first)
     - Secondary: Chapters with no wrong answers (by id)
   - Include quiz progress (total quizzes vs completed from submissions table)

**Response when pretest not taken:**
```json
{
  "data": {
    "has_taken_pretest": false,
    "chapters": [
      {
        "id": 1,
        "title": "Basic Algebra",
        "description": "Learn fundamental algebraic concepts",
        "mascot_id": 1,
        "user_performance": null,
        "quiz_count": 5,
        "completed_quizzes": 0
      }
    ]
  }
}
```

---

## Business Logic Summary

1. **Pretest Flow:**
   - User takes pretest (no authentication required for GET questions)
   - User submits answers (requires authentication)
   - System calculates performance per chapter
   - Results stored in `pretest_submissions`

2. **Personalized Learning Path:**
   - Chapters are sorted by weakness (most wrong answers first)
   - Users focus on chapters they struggled with
   - Chapters with perfect scores appear last
   - If no pretest taken, show default order

3. **Progress Tracking:**
   - Track quiz completions per chapter
   - Show user's pretest performance alongside current progress
   - Help users see improvement over time