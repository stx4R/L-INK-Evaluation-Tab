export interface Interviewer {
  studentId: string;
  name: string;
  isAdmin?: boolean;
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

export interface BugReport {
  id: string;
  author_name: string;
  content: string;
  status: 'pending' | 'resolved';
  created_at: string;
}