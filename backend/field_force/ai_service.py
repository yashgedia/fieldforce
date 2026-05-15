import re

class MockAIService:
    @staticmethod
    def analyze_visit_notes(notes: str):
        """
        Mocked AI integration to analyze visit notes with high-utility output.
        """
        notes_lower = notes.lower()
        
        # Sophisticated Risk Assessment
        if re.search(r'\b(urgent|critical|delay|issue|problem|blocker|damage|failed|leak|broken|stolen)\b', notes_lower):
            risk_flag = 'HIGH'
        elif re.search(r'\b(warning|attention|moderate|check|minor|needs|pending|partial)\b', notes_lower):
            risk_flag = 'MEDIUM'
        else:
            risk_flag = 'LOW'
            
        # Context-Aware Summary Generation
        words = notes.split()
        report_segment = " ".join(words[:15]) + "..." if len(words) > 15 else notes
        
        summary = (
            f"Dynamic Field Intelligence: The current execution analysis identifies a {risk_flag.lower()} risk operational profile. "
            f"The field agent documented specific findings: '{report_segment}'. "
            f"Sentiment analysis confirms a {'stabilized' if risk_flag == 'LOW' else 'disrupted'} workflow pattern."
        )
            
        # Strategic Prescriptive Actions
        if risk_flag == 'HIGH':
            suggested_action = (
                "IMMEDIATE ESCALATION: Site integrity is compromised. Trigger supervisor notification and "
                "provision emergency maintenance teams. Review equipment logs for similar patterns across this region."
            )
        elif risk_flag == 'MEDIUM':
            suggested_action = (
                "MONITORING REQUIRED: Observation indicates non-critical anomalies. Schedule a physical "
                "re-verification within 72 hours. Update inventory records for potential wear-and-tear replacement."
            )
        else:
            suggested_action = (
                "OPERATIONAL CONTINUITY: Execution successful with zero variance. No immediate intervention required. "
                "Logged in historical performance vault. Continue standard maintenance cycle."
            )
            
        return {
            'summary': summary,
            'risk_flag': risk_flag,
            'suggested_action': suggested_action
        }
