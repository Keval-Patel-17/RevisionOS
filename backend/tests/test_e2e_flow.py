from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_full_flow():
    # 1. Health
    h_res = client.get('/api/health')
    assert h_res.status_code == 200
    h = h_res.json()
    assert h['status'] == 'healthy'
    assert 'gemini_model' in h

    # 2. Demo document
    demo_res = client.post('/api/demo')
    assert demo_res.status_code == 200
    demo = demo_res.json()
    file_id = demo['file_id']
    assert demo['page_count'] >= 2

    # 3. Generate revision pack
    rev_req = {
        'file_id': file_id,
        'course_name': 'Operating Systems (CPU Scheduling)',
        'study_goal': 'Exam Preparation',
        'difficulty': 'Intermediate',
        'exam_style': 'Mixed',
        'notes_length': 'Balanced'
    }
    rev_res = client.post('/api/generate-revision', json=rev_req)
    assert rev_res.status_code == 200
    rev_pack = rev_res.json()
    assert len(rev_pack['topics']) >= 4

    # 4. Generate Quiz
    quiz_req = {
        'file_id': file_id,
        'course_name': rev_pack['course_name'],
        'difficulty': 'Intermediate',
        'exam_style': 'Mixed'
    }
    q_res = client.post('/api/generate-quiz', json=quiz_req)
    assert q_res.status_code == 200
    questions = q_res.json()
    assert 5 <= len(questions) <= 20

    # 5. Evaluate Quiz
    submissions = [
        {'question_id': q['id'], 'user_answer': q['correct_answer']}
        for q in questions
    ]
    if len(submissions) > 3:
        submissions[3]['user_answer'] = 'Incorrect Option'
    eval_res = client.post('/api/quiz/evaluate', json={'submissions': submissions, 'quiz_questions': questions}).json()
    assert eval_res['score'] == len(questions) - 1
    assert len(eval_res['weak_topics']) == 1

    # 6. Export PDF
    exp_req = {
        'format': 'pdf',
        'revision_pack': rev_pack,
        'quiz_questions': questions,
        'quiz_evaluation': eval_res
    }
    pdf_res = client.post('/api/export', json=exp_req)
    assert pdf_res.status_code == 200
    assert pdf_res.content.startswith(b'%PDF')

    # 7. Export Markdown
    exp_req['format'] = 'markdown'
    md_res = client.post('/api/export', json=exp_req)
    assert md_res.status_code == 200
    assert '# RevisionOS' in md_res.text

    # 8. Export DOCX
    exp_req['format'] = 'docx'
    docx_res = client.post('/api/export', json=exp_req)
    assert docx_res.status_code == 200
    assert docx_res.content.startswith(b'PK')

if __name__ == '__main__':
    test_full_flow()
