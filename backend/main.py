# backend/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import sys
import os

# Add local path to find agents
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from agents.weak_subject_agent import WeakSubjectAgent
from agents.risk_agent import AcademicRiskAgent
from agents.study_plan_agent import StudyPlanAgent
from agents.advanced_mentorship_insight_agent import AdvancedMentorshipAgent
from services.ollama_wrapper import OllamaGenerator

app = FastAPI(title="Student Success API")

# Allow Frontend to talk to Backend (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js runs here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Load Data (Cached in memory) ---
def load_data():
    students = pd.read_csv("data/students.csv", dtype=str)
    subjects = pd.read_csv("data/subjects.csv", dtype=str)
    performance = pd.read_csv("data/performance.csv", dtype=str)
    
    # Cleaning (Same logic as Streamlit)
    students = students.apply(lambda x: x.str.strip())
    performance["marks_obtained"] = pd.to_numeric(performance["marks_obtained"], errors="coerce").fillna(0)
    performance["attendance"] = pd.to_numeric(performance.get("attendance", 0), errors="coerce").fillna(0)
    
    return students, subjects, performance

students_df, subjects_df, performance_df = load_data()

# Initialize Agents
weak_agent = WeakSubjectAgent()
risk_agent = AcademicRiskAgent()
study_agent = StudyPlanAgent()
mentorship_agent = AdvancedMentorshipAgent()
ollama_fast = OllamaGenerator(model="deepseek-r1:1.5b") 

# 2. Use the SMART model (8b) for Roadmaps so it thinks deeply
ollama_smart = OllamaGenerator(model="deepseek-r1:8b")

# --- Pre-calculate Agent Data ---
# (In production, you might do this per request or cache it in a DB)
weak_results = weak_agent.run(performance_df, subjects_df)
risk_results = risk_agent.run(performance_df, subjects_df)
plan_results = study_agent.run(weak_results)

# --- Pydantic Models for Inputs ---
class ChatRequest(BaseModel):
    student_id: str
    message: str
    context: dict

class RoadmapRequest(BaseModel):
    student_id: str
    risk_level: str
    weak_subjects: str

# --- API Endpoints ---

@app.get("/api/students")
def get_students():
    """Returns list of students for the sidebar"""
    return students_df[["student_id", "name", "branch", "current_semester"]].to_dict(orient="records")

@app.get("/api/dashboard/{student_id}")
def get_student_dashboard(student_id: str):
    """Returns all metrics, risk, and weak subjects for a specific student"""
    # 1. Student Info
    student = students_df[students_df["student_id"] == student_id].to_dict(orient="records")
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    student = student[0]

    # 2. Metrics
    att = performance_df[performance_df["student_id"] == student_id]["attendance"].mean()
    
    # 3. Agent Results
    risk = risk_results[risk_results["student_id"] == student_id].to_dict(orient="records")
    weak = weak_results[weak_results["student_id"] == student_id].merge(subjects_df, on="subject_id", how="left")
    plan = plan_results[plan_results["student_id"] == student_id].to_dict(orient="records")

    # 4. Generate Static Mentorship Insight
    insight = mentorship_agent.generate_mentorship(
        student_info=students_df[students_df["student_id"] == student_id].iloc[0],
        student_risk=risk_results[risk_results["student_id"] == student_id],
        student_weak=weak,
        student_plan=plan_results[plan_results["student_id"] == student_id]
    )

    return {
        "profile": student,
        "attendance": round(att, 1),
        "risk": risk[0] if risk else {"risk_level": "Unknown", "risk_score": 0},
        "weak_subjects": weak[["name", "avg_score"]].to_dict(orient="records"),
        "study_plan": plan,
        "mentorship_insight": insight
    }

@app.post("/api/chat")
def chat_with_mentor(req: ChatRequest):
    """DeepSeek Chat Endpoint"""
    system_prompt = f"""
    Act as a concise academic mentor for {req.context.get('name')}.
    Status: Risk {req.context.get('risk')}, Weak in: {req.context.get('weak_subjects')}.
    
    User Question: {req.message}
    
    Instruction: Reply in strictly 2-3 sentences. Be actionable and motivating. Do not use headers or bullet points.
    """
    response = ollama_fast.enhance(system_prompt)
    return {"reply": response}

@app.post("/api/roadmap")
def generate_roadmap(req: RoadmapRequest):
    """Generates the roadmap via DeepSeek"""
    prompt = f"""
    Create a concise academic roadmap for student ID {req.student_id}.
    Risk: {req.risk_level}. Weak Subjects: {req.weak_subjects}.
    Format: 1. Weekly Goals, 2. Quick Wins, 3. Motivation.
    """
    response = ollama_smart.enhance(prompt)
    return {"roadmap": response}