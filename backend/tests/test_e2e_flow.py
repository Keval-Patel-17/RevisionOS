import requests

BASE = 'http://127.0.0.1:8000/api'

def test_full_flow():
    # 1. Health
    h = requests.get(f'{BASE}/health').json()
    print('Health:', h['status'], '| Model:', h['gemini_model'])
    assert h['status'] == 'healthy'

    # 2. Demo document
    demo = requests.post(f'{BASE}/demo').json()
    file_id = demo['file_id']
    print(f"Demo loaded: {demo['filename']} | Pages: {demo['page_count']} | Chars: {demo['char_count']}")
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
    rev_pack = requests.post(f'{BASE}/generate-revision', json=rev_req).json()
    print('Revision Pack generated!')
    print('Course:', rev_pack['course_name'])
    print('Detected topics count:', len(rev_pack['topics']))
    print('High-priority count:', rev_pack['high_priority_count'])
    for t in rev_pack['topics']:
        print(f" - [{t['priority']}] {t['topic_title']} (Source: {t['source_reference']})")
    assert len(rev_pack['topics']) >= 4

    # 4. Generate Quiz
    quiz_req = {
        'file_id': file_id,
        'course_name': rev_pack['course_name'],
        'difficulty': 'Intermediate',
        'exam_style': 'Mixed'
    }
    questions = requests.post(f'{BASE}/generate-quiz', json=quiz_req).json()
    print('Quiz questions generated! Count:', len(questions))
    for q in questions:
        print(f" - Q: {q['question']} [{q['question_type']}] (Source: {q['source_reference']})")
    assert 5 <= len(questions) <= 20

    # 5. Evaluate Quiz
    submissions = [
        {'question_id': q['id'], 'user_answer': q['correct_answer']}
        for q in questions
    ]
    # Mark one question incorrect to test weak area detection
    if len(submissions) > 3:
        submissions[3]['user_answer'] = 'Incorrect Option'
    eval_res = requests.post(f'{BASE}/quiz/evaluate', json={'submissions': submissions, 'quiz_questions': questions}).json()
    print('Quiz Evaluated!')
    print(f"Score: {eval_res['score']}/{eval_res['total_questions']} ({eval_res['percentage']}%)")
    print('Weak topics detected:', [w['topic_title'] for w in eval_res['weak_topics']])
    print('Micro-revision sprint:', eval_res['revise_this_next_summary'])
    assert eval_res['score'] == len(questions) - 1
    assert len(eval_res['weak_topics']) == 1

    # 6. Export PDF
    exp_req = {
        'format': 'pdf',
        'revision_pack': rev_pack,
        'quiz_questions': questions,
        'quiz_evaluation': eval_res
    }
    pdf_res = requests.post(f'{BASE}/export', json=exp_req)
    print('PDF Export status:', pdf_res.status_code, '| Length bytes:', len(pdf_res.content))
    assert pdf_res.status_code == 200
    assert pdf_res.content.startswith(b'%PDF')

    # 7. Export Markdown
    exp_req['format'] = 'markdown'
    md_res = requests.post(f'{BASE}/export', json=exp_req)
    print('Markdown Export status:', md_res.status_code, '| Characters:', len(md_res.text))
    assert md_res.status_code == 200
    assert '# RevisionOS' in md_res.text

    # 8. Export DOCX
    exp_req['format'] = 'docx'
    docx_res = requests.post(f'{BASE}/export', json=exp_req)
    print('DOCX Export status:', docx_res.status_code, '| Length bytes:', len(docx_res.content))
    assert docx_res.status_code == 200
    assert docx_res.content.startswith(b'PK')

    print('\nALL END-TO-END FLOWS PASSED PERFECTLY!')

if __name__ == '__main__':
    test_full_flow()
