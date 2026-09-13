from typing import List, Dict, Tuple
from ..schemas.document import DocumentChunk
from ..schemas.revision import TopicNote
from ..schemas.quiz import QuizQuestion
from ..utils.logger import logger

class GroundingService:
    @staticmethod
    def verify_topic_grounding(topics: List[TopicNote], source_chunks: List[DocumentChunk]) -> Tuple[List[TopicNote], float]:
        """
        Verifies that each topic references actual content in the source chunks.
        Normalizes source references if missing.
        """
        if not source_chunks:
            return topics, 0.0
            
        verified_topics: List[TopicNote] = []
        valid_refs = 0
        
        available_refs = [c.source_reference for c in source_chunks]
        all_source_text = " ".join([c.text.lower() for c in source_chunks])
        
        for topic in topics:
            # Check if source_reference is valid or matches any chunk
            ref_match = any(ref.lower() in topic.source_reference.lower() for ref in available_refs)
            # Check if core title or key concepts exist in text
            keyword_match = topic.topic_title.lower() in all_source_text
            
            if not topic.source_reference or not ref_match:
                # Find best matching chunk by keyword overlap
                best_ref = available_refs[0]
                best_overlap = 0
                for chunk in source_chunks:
                    overlap = sum(1 for word in topic.topic_title.lower().split() if len(word) > 3 and word in chunk.text.lower())
                    if overlap > best_overlap:
                        best_overlap = overlap
                        best_ref = chunk.source_reference
                topic.source_reference = best_ref
                
            if ref_match or keyword_match:
                valid_refs += 1
                
            verified_topics.append(topic)
            
        confidence = round(valid_refs / max(1, len(topics)), 2)
        return verified_topics, confidence

    @staticmethod
    def verify_quiz_grounding(questions: List[QuizQuestion], source_chunks: List[DocumentChunk]) -> List[QuizQuestion]:
        if not source_chunks:
            return questions
            
        available_refs = [c.source_reference for c in source_chunks]
        all_text = " ".join([c.text.lower() for c in source_chunks])
        
        for q in questions:
            if not q.source_reference or not any(r.lower() in q.source_reference.lower() for r in available_refs):
                best_ref = available_refs[0]
                best_overlap = 0
                for chunk in source_chunks:
                    overlap = sum(1 for word in q.question.lower().split() if len(word) > 3 and word in chunk.text.lower())
                    if overlap > best_overlap:
                        best_overlap = overlap
                        best_ref = chunk.source_reference
                q.source_reference = best_ref
        return questions

grounding_service = GroundingService()
