import re

def get_chatbot_response(query: str, student_name: str, metrics: dict) -> str:
    """Evaluates a user query and returns a contextual advisor response based on student analytics."""
    q = query.lower()
    
    # Retrieve metrics safely
    attendance = metrics.get("attendance", 85.0)
    study_hours = metrics.get("study_hours", 12.0)
    predicted_score = metrics.get("predicted_score", 75.0)
    risk_level = metrics.get("risk_level", "Medium")
    sleep_hours = metrics.get("sleep_hours", 7.0)
    assignment_scores = metrics.get("assignment_scores", 78.0)
    participation = metrics.get("participation", 70.0)
    
    # Base greetings
    if re.search(r'\b(hi|hello|hey|greetings|hola)\b', q):
        return (
            f"Hello {student_name}! I am your AI Academic Advisor. "
            f"I have analyzed your current learning patterns. You currently have a predicted final score "
            f"of <b>{predicted_score}%</b>, putting you at a <b>{risk_level}</b> academic risk level. "
            f"Ask me about how to improve, your risk factors, or study strategies!"
        )
        
    # Risk query
    if any(k in q for k in ["risk", "fail", "status", "predict", "pass", "standing"]):
        response = f"Your current academic risk level is evaluated as <b>{risk_level}</b>. "
        if risk_level == "High":
            response += (
                f"This is mainly due to a predicted score of {predicted_score}%. "
                f"To drop out of High risk, we need to focus heavily on raising your attendance "
                f"(currently {attendance}%) and increasing study hours from {study_hours} hrs/week. "
                f"I recommend making a weekly target tracker."
            )
        elif risk_level == "Medium":
            response += (
                f"You are in a stable but vulnerable position with a predicted score of {predicted_score}%. "
                f"Focus on submitting outstanding assignments and getting assignment scores above 80% (currently {assignment_scores}%)."
            )
        else:
            response += (
                f"Fantastic work! You are in the Low risk tier. Your predicted score is {predicted_score}%. "
                f"Maintain your attendance at {attendance}% and continue your current study routine."
            )
        return response

    # Improvement query
    if any(k in q for k in ["improve", "better", "grade", "score", "gpa", "help", "study"]):
        recs = []
        if attendance < 85.0:
            recs.append(f"Raise class attendance (currently {attendance}%). Target 90% by attending regularly.")
        if study_hours < 15.0:
            recs.append(f"Increase weekly study hours (currently {study_hours} hrs). Try scheduling 2 hours daily.")
        if assignment_scores < 80.0:
            recs.append(f"Boost assignment quality (currently {assignment_scores}%). Review assignment guidelines before submission.")
        if sleep_hours < 7.0:
            recs.append(f"Increase nightly sleep (currently {sleep_hours} hrs). Sleep improves memory and exam alertness.")
            
        if not recs:
            return (
                f"Your performance is excellent, {student_name}! "
                f"To push your predicted score of {predicted_score}% even higher, "
                f"consider taking on peer tutor opportunities or speaking with faculty about independent honors projects."
            )
        
        return (
            f"Here is your personalized roadmap to improve your grades:<br/>" + 
            "".join([f"• {r}<br/>" for r in recs]) +
            f"Implementing these will increase your predicted score of <b>{predicted_score}%</b> and lower your risk."
        )

    # Sleep queries
    if any(k in q for k in ["sleep", "rest", "tired", "bed", "fatigue"]):
        if sleep_hours < 6.5:
            return (
                f"I noticed your average sleep is only <b>{sleep_hours} hours</b>. "
                f"Research shows students getting under 7 hours of sleep have a 15% reduction in cognitive retention. "
                f"Prioritizing sleep will help you feel more alert and improve class participation (currently at {participation}%)."
            )
        else:
            return (
                f"Your sleep duration of <b>{sleep_hours} hours</b> is healthy! "
                f"Getting consistent sleep ensures your brain processes what you studied for {study_hours} hours this week."
            )

    # Attendance query
    if any(k in q for k in ["attendance", "absent", "miss", "class"]):
        if attendance < 80.0:
            return (
                f"Your attendance is <b>{attendance}%</b>, which is below the recommended 85% threshold. "
                f"Academic correlation shows missing class is the single biggest predictor of GPA drops. "
                f"Let's focus on attending all lectures next week!"
            )
        else:
            return (
                f"Great job keeping your attendance at <b>{attendance}%</b>! "
                f"Being present ensures you keep up with class participation."
            )

    # Assignment query
    if any(k in q for k in ["assignment", "homework", "marks", "grade", "score"]):
        if assignment_scores < 75.0:
            return (
                f"Your assignment average is <b>{assignment_scores}%</b>. "
                f"We can improve this by breaking assignments down and submitting drafts early. "
                f"Talk to your teacher to see if you can resubmit any pending tasks."
            )
        else:
            return (
                f"Your assignment average of <b>{assignment_scores}%</b> is strong! "
                f"Keep up this diligence to lock in your final score of {predicted_score}%."
            )

    # Default fallback
    return (
        f"I hear you, {student_name}. While I am processing that, remember that small shifts in "
        f"study hours (current: {study_hours} hrs/wk) and attendance (current: {attendance}%) "
        f"can create massive improvements in your predicted final grade. Is there a specific subject "
        f"or metric you are worried about?"
    )
