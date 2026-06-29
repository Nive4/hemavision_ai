"""
HemaVision AI — XGBoost Symptom Risk Classifier Training
=========================================================
Trains an XGBoost multi-class classifier on synthetic symptom questionnaire data.
Uses clinically validated symptom-hemoglobin correlations to generate realistic
training distributions.

Risk classes: Normal (0), Mild (1), Moderate (2), Severe (3)
Features: 14 symptom indicators (binary/ordinal: no=0, sometimes=1, yes=2)

Run:
    python -m backend.app.ml.train.train_symptom
"""

import os
import sys
import json
import numpy as np
import xgboost as xgb
from pathlib import Path
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

# Add project root
PROJECT_ROOT = Path(__file__).resolve().parents[4]
sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.config import settings

# 14 clinical symptom indicators used in the app
SYMPTOM_FEATURES = [
    "fatigue",
    "dizziness",
    "headache",
    "shortness_of_breath",
    "pale_skin",
    "cold_hands_feet",
    "weakness",
    "chest_pain",
    "brittle_nails",
    "tongue_soreness",
    "irregular_heartbeat",
    "poor_appetite",
    "craving_non_food",
    "difficulty_concentrating"
]

# Clinical weights: how strongly each symptom correlates with anemia severity
# Based on medical literature (higher = stronger indicator)
SYMPTOM_WEIGHTS = {
    "fatigue": 0.90,
    "dizziness": 0.75,
    "headache": 0.55,
    "shortness_of_breath": 0.80,
    "pale_skin": 0.85,
    "cold_hands_feet": 0.60,
    "weakness": 0.80,
    "chest_pain": 0.70,
    "brittle_nails": 0.65,
    "tongue_soreness": 0.70,
    "irregular_heartbeat": 0.60,
    "poor_appetite": 0.50,
    "craving_non_food": 0.75,   # Pica — strong indicator
    "difficulty_concentrating": 0.55
}


def generate_synthetic_dataset(n_samples: int = 2000, seed: int = 42) -> tuple:
    """
    Generate clinically realistic synthetic symptom data.
    
    Each sample has 14 features (symptom scores: 0, 1, or 2)
    and a risk label (0=Normal, 1=Mild, 2=Moderate, 3=Severe).
    
    The distribution is modeled so that:
      - Normal: few symptoms, mostly "no" (0)
      - Mild: some symptoms at "sometimes" (1)
      - Moderate: many symptoms at "sometimes"/"yes" (1-2)
      - Severe: most symptoms at "yes" (2)
    """
    np.random.seed(seed)
    
    X = []
    y = []
    
    # Generate samples per class with realistic distributions
    samples_per_class = n_samples // 4
    
    for risk_class in range(4):
        for _ in range(samples_per_class):
            sample = []
            for symptom in SYMPTOM_FEATURES:
                weight = SYMPTOM_WEIGHTS[symptom]
                
                if risk_class == 0:  # Normal
                    # Mostly 0 (no), rarely 1 (sometimes)
                    probs = [0.80, 0.15, 0.05]
                elif risk_class == 1:  # Mild
                    # Mix of 0 and 1, weighted by symptom relevance
                    p_yes = weight * 0.15
                    p_sometimes = weight * 0.35
                    p_no = 1.0 - p_yes - p_sometimes
                    probs = [max(0.1, p_no), p_sometimes, p_yes]
                elif risk_class == 2:  # Moderate
                    p_yes = weight * 0.40
                    p_sometimes = weight * 0.35
                    p_no = 1.0 - p_yes - p_sometimes
                    probs = [max(0.05, p_no), p_sometimes, p_yes]
                else:  # Severe
                    p_yes = weight * 0.70
                    p_sometimes = weight * 0.25
                    p_no = 1.0 - p_yes - p_sometimes
                    probs = [max(0.02, p_no), p_sometimes, p_yes]
                
                # Normalize probabilities
                total = sum(probs)
                probs = [p / total for p in probs]
                
                value = np.random.choice([0, 1, 2], p=probs)
                sample.append(value)
            
            # Add slight noise: occasionally shift the class label
            # to make boundaries realistic (not perfectly separable)
            noise = np.random.random()
            actual_class = risk_class
            if noise < 0.05:  # 5% label noise
                actual_class = max(0, min(3, risk_class + np.random.choice([-1, 1])))
            
            X.append(sample)
            y.append(actual_class)
    
    return np.array(X), np.array(y)


def train_symptom_model():
    """Train and save XGBoost symptom risk classifier"""
    print("╔══════════════════════════════════════════════════════════╗")
    print("║   HemaVision AI — XGBoost Symptom Model Training        ║")
    print("╚══════════════════════════════════════════════════════════╝")
    
    # Generate dataset
    print("\n📊 Generating synthetic clinical symptom dataset...")
    X, y = generate_synthetic_dataset(n_samples=2000)
    print(f"  Total samples: {len(X)}")
    print(f"  Class distribution: {dict(zip(*np.unique(y, return_counts=True)))}")
    
    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"  Train: {len(X_train)}, Test: {len(X_test)}")
    
    # Train XGBoost
    print("\n🔬 Training XGBoost multi-class classifier...")
    model = xgb.XGBClassifier(
        objective='multi:softprob',
        num_class=4,
        max_depth=5,
        learning_rate=0.1,
        n_estimators=200,
        min_child_weight=2,
        subsample=0.8,
        colsample_bytree=0.8,
        gamma=0.1,
        reg_alpha=0.1,
        reg_lambda=1.0,
        random_state=42,
        eval_metric='mlogloss',
        verbosity=0
    )
    
    model.fit(
        X_train, y_train,
        eval_set=[(X_test, y_test)],
        verbose=False
    )
    
    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred) * 100
    
    print(f"\n📊 Test Accuracy: {accuracy:.1f}%")
    
    # Classification report
    class_names = ["Normal", "Mild", "Moderate", "Severe"]
    report = classification_report(y_test, y_pred, target_names=class_names)
    print(f"\n  Classification Report:\n{report}")
    
    # Confusion matrix
    cm = confusion_matrix(y_test, y_pred)
    print(f"  Confusion Matrix:")
    print(f"  {'':12s} {'Normal':>8s} {'Mild':>8s} {'Moderate':>8s} {'Severe':>8s}")
    for i, row in enumerate(cm):
        print(f"  {class_names[i]:12s} {row[0]:8d} {row[1]:8d} {row[2]:8d} {row[3]:8d}")
    
    # Cross-validation
    print(f"\n  5-Fold Cross-Validation...")
    cv_scores = cross_val_score(model, X, y, cv=5, scoring='accuracy')
    print(f"  CV Accuracy: {cv_scores.mean()*100:.1f}% ± {cv_scores.std()*100:.1f}%")
    
    # Feature importance
    importances = model.feature_importances_
    sorted_idx = np.argsort(importances)[::-1]
    print(f"\n  Feature Importance (Top 5):")
    for i in range(min(5, len(sorted_idx))):
        idx = sorted_idx[i]
        print(f"    {i+1}. {SYMPTOM_FEATURES[idx]:25s} = {importances[idx]:.4f}")
    
    # Save model
    os.makedirs(settings.MODEL_DIR, exist_ok=True)
    model_path = os.path.join(settings.MODEL_DIR, "symptom_model.json")
    model.save_model(model_path)
    print(f"\n  💾 Model saved to: {model_path}")
    
    # Save training report
    report_data = {
        "accuracy": round(accuracy, 2),
        "cv_accuracy_mean": round(cv_scores.mean() * 100, 2),
        "cv_accuracy_std": round(cv_scores.std() * 100, 2),
        "feature_importance": {
            SYMPTOM_FEATURES[i]: round(float(importances[i]), 4)
            for i in sorted_idx
        },
        "classification_report": classification_report(
            y_test, y_pred, target_names=class_names, output_dict=True
        ),
        "confusion_matrix": cm.tolist(),
        "n_train": len(X_train),
        "n_test": len(X_test),
    }
    
    report_path = os.path.join(settings.MODEL_DIR, "symptom_training_report.json")
    with open(report_path, "w") as f:
        json.dump(report_data, f, indent=2)
    print(f"  📋 Training report saved to: {report_path}")
    
    print(f"\n  ✅ Symptom model training complete!")
    return model


if __name__ == "__main__":
    train_symptom_model()
