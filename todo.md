# AI Resume Analyzer - ML Model Integration TODO

## Project Requirement Change
- ❌ OLD: Use Manus LLM API (not allowed for project expo)
- ✅ NEW: Use trained ML models with datasets (required for project expo)

## Phase 1: ML Model Planning & Strategy

### ML Models to Train
- [ ] **Model 1: Skill Extractor (NER)** - Extract skills from resume text
- [ ] **Model 2: Resume Feedback Generator** - Generate improvement suggestions
- [ ] **Model 3: Chatbot Intent Classifier** - Classify user questions and generate responses
- [ ] **Model 4: Section Classifier** - Classify resume sections (Summary, Experience, etc.)

### Dataset Creation
- [ ] Create labeled dataset for skill extraction (100+ samples)
- [ ] Create labeled dataset for resume feedback (100+ samples)
- [ ] Create Q&A dataset for chatbot (50+ Q&A pairs)
- [ ] Create labeled dataset for section classification (100+ samples)

### Model Architecture Decisions
- [ ] Skill Extractor: spaCy NER or sklearn-based
- [ ] Feedback Generator: Rule-based + ML classification
- [ ] Chatbot: Intent classification + template responses
- [ ] Section Classifier: sklearn text classification

## Phase 2: ML Model Development

### Skill Extraction Model
- [ ] Install spaCy and download pre-trained models
- [ ] Create training data for NER
- [ ] Train custom NER model on resume skills
- [ ] Test and evaluate model accuracy
- [ ] Save trained model

### Resume Feedback Model
- [ ] Create training dataset with resume feedback
- [ ] Train text classification model (sklearn)
- [ ] Generate feedback templates for each class
- [ ] Integrate with backend
- [ ] Test feedback generation

### Chatbot Intent Model
- [ ] Create Q&A dataset for resume-related questions
- [ ] Train intent classification model (sklearn)
- [ ] Create response templates for each intent
- [ ] Implement fallback responses
- [ ] Test chatbot interactions

### Section Classification Model
- [ ] Create labeled dataset for resume sections
- [ ] Train text classification model
- [ ] Test section detection accuracy
- [ ] Integrate with resume parser

## Phase 3: Backend Integration

### Install ML Dependencies
- [ ] Add scikit-learn to dependencies
- [ ] Add spaCy to dependencies
- [ ] Add numpy and pandas
- [ ] Add joblib for model serialization

### Create ML Service Layer
- [ ] Create `/server/ml/skillExtractor.ts` - Load and use NER model
- [ ] Create `/server/ml/feedbackGenerator.ts` - Generate feedback
- [ ] Create `/server/ml/chatbotIntent.ts` - Classify intents
- [ ] Create `/server/ml/sectionClassifier.ts` - Classify sections

### Model Loading
- [ ] Load all models on server startup
- [ ] Handle model loading errors gracefully
- [ ] Cache models in memory for performance

## Phase 4: Replace API Calls

### Resume Analysis Endpoint
- [ ] Replace LLM call with ML models
- [ ] Use skill extractor for skills
- [ ] Use feedback generator for suggestions
- [ ] Use section classifier for section analysis
- [ ] Return same response format

### Chatbot Endpoint
- [ ] Replace LLM call with intent classifier
- [ ] Use trained intent model
- [ ] Generate responses from templates
- [ ] Maintain conversation history

### Cover Letter Generation
- [ ] Replace LLM with template-based generation
- [ ] Use extracted skills and experience
- [ ] Generate professional cover letter
- [ ] Allow customization

### LinkedIn Suggestions
- [ ] Replace LLM with rule-based suggestions
- [ ] Use extracted skills and experience
- [ ] Generate headline, summary, skills suggestions
- [ ] Return formatted suggestions

## Phase 5: Testing & Optimization

### Unit Tests
- [ ] Test skill extraction accuracy
- [ ] Test feedback generation
- [ ] Test intent classification
- [ ] Test section classification

### Integration Tests
- [ ] Test resume upload with ML analysis
- [ ] Test chatbot with various questions
- [ ] Test cover letter generation
- [ ] Test LinkedIn suggestions

### Performance Tests
- [ ] Measure model inference time
- [ ] Optimize slow models
- [ ] Test with large resumes
- [ ] Benchmark against requirements

### Accuracy Evaluation
- [ ] Evaluate skill extraction accuracy
- [ ] Evaluate feedback quality
- [ ] Evaluate intent classification accuracy
- [ ] Document model performance metrics

## Phase 6: Documentation

### ML Model Documentation
- [ ] Document each model's architecture
- [ ] Document training process
- [ ] Document dataset structure
- [ ] Document model performance metrics
- [ ] Create ML_MODELS.md file

### Training Scripts
- [ ] Create training script for each model
- [ ] Document how to retrain models
- [ ] Document dataset format
- [ ] Create data preparation scripts

### API Documentation
- [ ] Document new ML inference endpoints
- [ ] Document model loading process
- [ ] Document error handling
- [ ] Update JUDGE_SHOWCASE.md

## Phase 7: Final Deployment

### Code Quality
- [ ] Fix all TypeScript errors
- [ ] Add error handling for ML predictions
- [ ] Add logging for debugging
- [ ] Test all features end-to-end

### Performance Optimization
- [ ] Optimize model loading
- [ ] Cache predictions where possible
- [ ] Minimize inference time
- [ ] Test under load

### Final Testing
- [ ] Test resume upload
- [ ] Test AI analysis
- [ ] Test chatbot
- [ ] Test cover letter generation
- [ ] Test LinkedIn suggestions
- [ ] Test on different browsers
- [ ] Test on mobile devices

### Deployment
- [ ] Save final checkpoint
- [ ] Push to GitHub
- [ ] Verify live website works
- [ ] Create final documentation

---

## Feature Status

| Feature | Status | ML Integration |
|---------|--------|-----------------|
| Resume Upload | ✅ Working | No change needed |
| ATS Scoring | ✅ Working | No change (custom algorithm) |
| Readability Score | ✅ Working | No change (Flesch-Kincaid) |
| Keyword Analysis | ✅ Working | No change (custom algorithm) |
| Skill Extraction | 🔄 Updating | ML NER Model |
| Resume Feedback | 🔄 Updating | ML Classification Model |
| Chatbot | 🔄 Updating | ML Intent Classifier |
| Cover Letter | 🔄 Updating | Template-based (no API) |
| LinkedIn Suggestions | 🔄 Updating | Rule-based (no API) |
| Resume History | ✅ Working | No change needed |
| Job Role Matching | ✅ Working | Use ML extracted skills |
| Report Download | ✅ Working | No change needed |

---

## Notes

- All ML models will be trained locally and saved as files
- No external APIs will be used (meeting project requirements)
- Models will be loaded on server startup
- Inference will be fast (<1 second per prediction)
- All models will have documented training procedures
- Dataset will be included in repository for reproducibility
