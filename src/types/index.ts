export interface Interviewer {
  studentId: string;
  name: string;
}

export interface Applicant {
  id: string;
  studentId: string;
  name: string;
  career: string;
  phone: string;
  schoolEmail: string;
  middleSchool: string;
  department: string;
  
  introduction: string;
  motivation: string;
  issue: string;
  issueRelation: string;
  tendency: string;
  reasonExample: string;
  futureActivity: string;
  resolution: string;
}

export interface QueueItem {
  id: string;
  interviewerId: string;
  interviewerName: string;
  timestamp: number;
}

export interface Evaluation {
  applicantId: string;
  interviewerId: string;
  score: number;
  comment: string;
}