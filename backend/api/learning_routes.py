from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/api/learning", tags=["Learning"])

# -- Models --

class QuizSubmission(BaseModel):
    lesson_id: int
    answers: List[int] # List of chosen option indices

# -- Data --

LESSONS = [
    {
        "id": 1,
        "title": "Saving vs Investing",
        "explanation": "Saving is the act of putting money aside for future use, typically in low-risk accounts like savings accounts. Investing is the process of using money to buy assets like stocks, bonds, or real estate with the goal of generating a return over time. While saving preserves capital, investing aims to grow it, albeit with higher risk.",
        "takeaways": [
            "Saving is for short-term goals and emergencies.",
            "Investing is for long-term wealth creation.",
            "Inflation can erode the purchasing power of savings over time."
        ],
        "quiz": [
            {
                "question": "What is the primary goal of investing?",
                "options": ["To hide money from taxes", "To preserve capital without risk", "To grow wealth over time", "To spend money quickly"],
                "correct": 2
            },
            {
                "question": "Which is generally better for an emergency fund?",
                "options": ["High-risk stocks", "A high-yield savings account", "Long-term real estate", "Crypto assets"],
                "correct": 1
            }
        ]
    },
    {
        "id": 2,
        "title": "Risk and Return",
        "explanation": "The risk-return tradeoff is a fundamental concept in finance. It states that the potential return on an investment rises with an increase in risk. To earn higher returns, investors must be willing to accept the possibility of higher losses. Low-risk investments like government bonds offer lower returns, while high-risk investments like individual stocks offer the potential for significant gains.",
        "takeaways": [
            "Higher potential returns usually come with higher risk.",
            "Risk tolerance depends on your age, financial goals, and comfort level.",
            "Diversification helps manage risk but doesn't eliminate it."
        ],
        "quiz": [
            {
                "question": "If an investment promises 50% returns with zero risk, it is likely...",
                "options": ["A great opportunity", "A government bond", "A scam or unrealistic", "A blue-chip stock"],
                "correct": 2
            }
        ]
    },
    {
        "id": 3,
        "title": "Diversification",
        "explanation": "Diversification is the practice of spreading your investments across different asset classes, industries, and geographical regions. The goal is to reduce the impact of any single investment's poor performance on your overall portfolio. In simple terms: 'Don't put all your eggs in one basket.'",
        "takeaways": [
            "Reduces unsystematic risk (company-specific risk).",
            "Ensures smoother portfolio performance over time.",
            "Doesn't guarantee against losses during a broad market crash."
        ],
        "quiz": [
            {
                "question": "What does diversification primarily aim to reduce?",
                "options": ["Transaction fees", "Taxes", "Specific investment risk", "The number of stocks you own"],
                "correct": 2
            }
        ]
    },
    {
        "id": 4,
        "title": "Inflation",
        "explanation": "Inflation is the rate at which the general level of prices for goods and services is rising, and subsequently, purchasing power is falling. If inflation is 5%, a loaf of bread that costs $1 today will cost $1.05 next year. For investors, it's crucial to earn a return that exceeds the inflation rate to maintain their standard of living.",
        "takeaways": [
            "Inflation reduces the value of cash over time.",
            "Stocks and real estate often act as hedges against inflation.",
            "Central banks aim for a target inflation rate (usually around 2%)."
        ],
        "quiz": [
            {
                "question": "If your bank account earns 1% interest and inflation is 3%, you are...",
                "options": ["Gaining wealth", "Staying even", "Losing purchasing power", "Beating the market"],
                "correct": 2
            }
        ]
    },
    {
        "id": 5,
        "title": "Compounding",
        "explanation": "Compounding is the process where the value of an investment increases because the earnings on an investment, both capital gains and interest, earn interest as time passes. Albert Einstein famously called it the 'Eighth Wonder of the World.' The earlier you start, the more powerful compounding becomes.",
        "takeaways": [
            "Time is the most important factor in compounding.",
            "Small initial investments can grow significantly over decades.",
            "Reinvesting dividends accelerates the compounding process."
        ],
        "quiz": [
            {
                "question": "Compounding is most effective when...",
                "options": ["You start late with a lot of money", "You start early and reinvest earnings", "You frequently withdraw your profits", "Interest rates are negative"],
                "correct": 1
            }
        ]
    }
]

# -- Endpoints --

@router.get("/lessons")
async def get_lessons():
    """Get all available financial lessons."""
    # Strip some data for the list view if needed
    return {"lessons": LESSONS}

@router.get("/lesson/{lesson_id}")
async def get_lesson(lesson_id: int):
    """Get a specific lesson by ID."""
    for lesson in LESSONS:
        if lesson["id"] == lesson_id:
            return {"lesson": lesson}
    raise HTTPException(status_code=404, detail="Lesson not found")

@router.post("/quiz")
async def submit_quiz(submission: QuizSubmission):
    """Score a quiz submission."""
    lesson = next((l for l in LESSONS if l["id"] == submission.lesson_id), None)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    questions = lesson["quiz"]
    if len(submission.answers) != len(questions):
        raise HTTPException(status_code=400, detail="Invalid number of answers")
    
    score = 0
    results = []
    for i, ans in enumerate(submission.answers):
        correct = questions[i]["correct"]
        is_correct = ans == correct
        if is_correct:
            score += 1
        results.append({
            "question_index": i,
            "user_answer": ans,
            "correct_answer": correct,
            "is_correct": is_correct
        })
    
    return {
        "score": score,
        "total": len(questions),
        "results": results,
        "percentage": (score / len(questions)) * 100
    }
