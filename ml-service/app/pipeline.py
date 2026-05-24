import os
import json
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, mean_squared_error, mean_absolute_error, r2_score
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.svm import SVC, SVR
from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor
from xgboost import XGBClassifier, XGBRegressor

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(DATA_DIR, exist_ok=True)

CSV_PATH = os.path.join(DATA_DIR, "student_data.csv")
CLASSIFIER_PATH = os.path.join(DATA_DIR, "best_classifier.joblib")
REGRESSOR_PATH = os.path.join(DATA_DIR, "best_regressor.joblib")
SCALER_PATH = os.path.join(DATA_DIR, "scaler.joblib")
METRICS_PATH = os.path.join(DATA_DIR, "metrics.json")

# Features: Attendance, Study hours, Previous grades, Assignment scores, Sleep hours, Internet access, Participation, Family support
FEATURE_NAMES = [
    "attendance", "study_hours", "previous_grades", "assignment_scores",
    "sleep_hours", "internet_access", "participation", "family_support"
]

def generate_synthetic_data(num_samples=1200):
    """Generates a realistic synthetic student performance dataset."""
    np.random.seed(42)
    
    # Independent variables
    attendance = np.random.uniform(50.0, 100.0, num_samples)
    study_hours = np.random.uniform(2.0, 30.0, num_samples)
    previous_grades = np.random.uniform(50.0, 100.0, num_samples)
    sleep_hours = np.random.uniform(4.0, 10.0, num_samples)
    internet_access = np.random.choice([0, 1], size=num_samples, p=[0.15, 0.85])
    participation = np.random.uniform(20.0, 100.0, num_samples)
    family_support = np.random.uniform(20.0, 100.0, num_samples)
    
    # Core grading logic with noise
    # Assignment scores depend heavily on study hours, attendance and a bit of noise
    assignment_scores = 0.4 * previous_grades + 0.3 * attendance + 1.2 * study_hours + np.random.normal(0, 5, num_samples)
    assignment_scores = np.clip(assignment_scores, 45.0, 100.0)
    
    # Calculate final grade (predicted score)
    # Weighted calculation
    score = (
        0.25 * attendance +
        0.20 * study_hours * 3.3 +  # scale study hours to ~100 max
        0.25 * previous_grades +
        0.20 * assignment_scores +
        0.05 * sleep_hours * 10 +
        0.02 * (internet_access * 100) +
        0.03 * participation
    )
    # Add noise
    score += np.random.normal(0, 4, num_samples)
    score = np.clip(score, 40.0, 100.0)
    
    # Determine Risk Level based on final score
    # High risk: < 60, Medium risk: 60-78, Low risk: > 78
    risk_level = []
    for s in score:
        if s < 60.0:
            risk_level.append("High")
        elif s < 78.0:
            risk_level.append("Medium")
        else:
            risk_level.append("Low")
            
    df = pd.DataFrame({
        "attendance": attendance,
        "study_hours": study_hours,
        "previous_grades": previous_grades,
        "assignment_scores": assignment_scores,
        "sleep_hours": sleep_hours,
        "internet_access": internet_access,
        "participation": participation,
        "family_support": family_support,
        "predicted_score": score,
        "risk_level": risk_level
    })
    
    df.to_csv(CSV_PATH, index=False)
    print(f"Generated {num_samples} student records and saved to {CSV_PATH}")
    return df

def get_recommendations_and_strategy(features):
    """Generates detailed, personalized feedback based on student profile features."""
    attendance = features.get("attendance", 80.0)
    study_hours = features.get("study_hours", 10.0)
    sleep_hours = features.get("sleep_hours", 7.0)
    assignment_scores = features.get("assignment_scores", 70.0)
    participation = features.get("participation", 60.0)
    
    recs = []
    strategies = []
    
    if attendance < 75.0:
        recs.append("Critical: Attend classes regularly.")
        strategies.append("Target at least 85% attendance by setting morning reminders and meeting the academic coordinator.")
    elif attendance < 85.0:
        recs.append("Improve lecture attendance to avoid missing crucial context.")
        strategies.append("Try to attend every class next week and sit in the front row to stay engaged.")
        
    if study_hours < 8.0:
        recs.append("Increase weekly independent study time.")
        strategies.append("Allocate at least 2 hours daily for self-study. Break it into 45-minute blocks using Pomodoro technique.")
    elif study_hours < 15.0:
        recs.append("Slightly increase study focus on core modules.")
        strategies.append("Establish a dedicated study schedule, aiming for 12-15 hours weekly.")
        
    if sleep_hours < 6.0:
        recs.append("Improve sleep patterns to boost cognitive performance.")
        strategies.append("Commit to a consistent bed time and aim for 7-8 hours of sleep. Avoid screen usage 30 mins before sleeping.")
        
    if assignment_scores < 70.0:
        recs.append("Seek help with assignment conceptual structures.")
        strategies.append("Schedule visits to the professor's office hours and participate in peer study groups to clarify homework questions.")
        
    if participation < 50.0:
        recs.append("Increase active class engagement.")
        strategies.append("Ask at least one question or offer one comment in each class session to build confidence.")
        
    # Fallback default if student is doing excellent
    if not recs:
        recs.append("Maintain high-performance habits.")
        strategies.append("Join peer-mentoring programs to assist others, or take on advanced elective courses to challenge yourself.")
        
    return " | ".join(recs), " | ".join(strategies)

def load_data():
    if not os.path.exists(CSV_PATH):
        df = generate_synthetic_data()
    else:
        df = pd.read_csv(CSV_PATH)
    return df

def train_pipeline():
    """Trains classification and regression pipelines for all 6 models, compares them, and saves the best."""
    df = load_data()
    
    X = df[FEATURE_NAMES]
    y_class = df["risk_level"]
    y_reg = df["predicted_score"]
    
    # Split
    X_train, X_test, y_train_class, y_test_class = train_test_split(X, y_class, test_size=0.2, random_state=42, stratify=y_class)
    _, _, y_train_reg, y_test_reg = train_test_split(X, y_reg, test_size=0.2, random_state=42)
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Save Scaler
    joblib.dump(scaler, SCALER_PATH)
    
    # Define Classifiers
    classifiers = {
        "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42),
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
        "Decision Tree": DecisionTreeClassifier(max_depth=6, random_state=42),
        "SVM": SVC(probability=True, random_state=42),
        "KNN": KNeighborsClassifier(n_neighbors=7),
        "XGBoost": XGBClassifier(use_label_encoder=False, eval_metric='mlogloss', random_state=42)
    }
    
    # Map text classes to integers for XGBoost
    class_map = {"Low": 0, "Medium": 1, "High": 2}
    rev_class_map = {0: "Low", 1: "Medium", 2: "High"}
    y_train_class_encoded = y_train_class.map(class_map)
    y_test_class_encoded = y_test_class.map(class_map)
    
    classifier_metrics = {}
    best_clf_name = ""
    best_clf_acc = -1
    best_clf_model = None
    
    for name, model in classifiers.items():
        if name == "XGBoost":
            model.fit(X_train_scaled, y_train_class_encoded)
            y_pred = model.predict(X_test_scaled)
            # convert back to labels
            y_pred_labels = [rev_class_map[val] for val in y_pred]
        else:
            model.fit(X_train_scaled, y_train_class)
            y_pred_labels = model.predict(X_test_scaled)
            
        acc = accuracy_score(y_test_class, y_pred_labels)
        precision, recall, f1, _ = precision_recall_fscore_support(y_test_class, y_pred_labels, average='weighted')
        
        classifier_metrics[name] = {
            "accuracy": float(acc),
            "precision": float(precision),
            "recall": float(recall),
            "f1_score": float(f1)
        }
        
        if acc > best_clf_acc:
            best_clf_acc = acc
            best_clf_name = name
            best_clf_model = model

    # Save best classifier
    # If best is XGBoost, we save the model. For mapping inside inference, we remember the best model name.
    joblib.dump({"name": best_clf_name, "model": best_clf_model, "class_map": class_map, "rev_class_map": rev_class_map}, CLASSIFIER_PATH)

    # Define Regressors
    regressors = {
        "Random Forest": RandomForestRegressor(n_estimators=100, random_state=42),
        "Logistic Regression": LinearRegression(), # Map to standard Linear Regression
        "Decision Tree": DecisionTreeRegressor(max_depth=6, random_state=42),
        "SVM": SVR(kernel='rbf'),
        "KNN": KNeighborsRegressor(n_neighbors=7),
        "XGBoost": XGBRegressor(random_state=42)
    }
    
    regressor_metrics = {}
    best_reg_name = ""
    best_reg_r2 = -float('inf')
    best_reg_model = None
    
    for name, model in regressors.items():
        model.fit(X_train_scaled, y_train_reg)
        y_pred = model.predict(X_test_scaled)
        
        rmse = np.sqrt(mean_squared_error(y_test_reg, y_pred))
        mae = mean_absolute_error(y_test_reg, y_pred)
        r2 = r2_score(y_test_reg, y_pred)
        
        regressor_metrics[name] = {
            "rmse": float(rmse),
            "mae": float(mae),
            "r2_score": float(r2)
        }
        
        if r2 > best_reg_r2:
            best_reg_r2 = r2
            best_reg_name = name
            best_reg_model = model
            
    # Save best regressor
    joblib.dump({"name": best_reg_name, "model": best_reg_model}, REGRESSOR_PATH)
    
    # Compute Feature Importance using the best model if it supports it, else Random Forest Regressor
    rf_reg = regressors["Random Forest"]
    importances = rf_reg.feature_importances_
    feature_importance = [
        {"feature": feat, "importance": float(imp)}
        for feat, imp in sorted(zip(FEATURE_NAMES, importances), key=lambda x: x[1], reverse=True)
    ]
    
    summary_metrics = {
        "classifiers": classifier_metrics,
        "regressors": regressor_metrics,
        "best_classifier": best_clf_name,
        "best_regressor": best_reg_name,
        "feature_importance": feature_importance,
        "dataset_size": len(df)
    }
    
    with open(METRICS_PATH, "w") as f:
        json.dump(summary_metrics, f, indent=4)
        
    return summary_metrics

def predict_single(features: dict):
    """Predicts score, risk, and details for a single student profile."""
    # Ensure model is trained
    if not os.path.exists(CLASSIFIER_PATH) or not os.path.exists(REGRESSOR_PATH) or not os.path.exists(SCALER_PATH):
        train_pipeline()
        
    scaler = joblib.load(SCALER_PATH)
    clf_data = joblib.load(CLASSIFIER_PATH)
    reg_data = joblib.load(REGRESSOR_PATH)
    
    input_data = [features[feat] for feat in FEATURE_NAMES]
    scaled_input = scaler.transform([input_data])
    
    # Regressor prediction
    reg_model = reg_data["model"]
    pred_score = float(reg_model.predict(scaled_input)[0])
    pred_score = max(0.0, min(100.0, pred_score))
    
    # Classifier prediction & confidence
    clf_model = clf_data["model"]
    clf_name = clf_data["name"]
    
    if clf_name == "XGBoost":
        # Predict encoded class
        pred_encoded = clf_model.predict(scaled_input)[0]
        pred_risk = clf_data["rev_class_map"][int(pred_encoded)]
        probs = clf_model.predict_proba(scaled_input)[0]
        confidence = float(probs[int(pred_encoded)])
    else:
        pred_risk = clf_model.predict(scaled_input)[0]
        probs = clf_model.predict_proba(scaled_input)[0]
        # Find index of predicted risk in classes_
        classes = list(clf_model.classes_)
        class_idx = classes.index(pred_risk)
        confidence = float(probs[class_idx])
        
    recs, strategy = get_recommendations_and_strategy(features)
    
    return {
        "predicted_score": round(pred_score, 2),
        "risk_level": pred_risk,
        "confidence_score": round(confidence, 4),
        "recommendations": recs,
        "improvement_strategy": strategy,
        "model_used": f"{clf_data['name']} (Classifier) & {reg_data['name']} (Regressor)"
    }
