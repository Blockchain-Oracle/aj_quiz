/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
export interface SubjectsResponse {
  message: string;
  status: number;
  subjects: Record<string, string>;
}

export interface ComprehensionYearsResponse {
  message: string;
  status: number;
  years: string[];
}

export interface QuestionResponse {
  id: number;
  question: string;
  option: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  section: string;
  image: string;
  answer: string;
  solution: string;
  examtype: string;
  examyear: string;
}

export interface ReportResponse {
  status: number;
  message: string;
}

export class AlocQuizService {
  private static readonly API_URL = "https://questions.aloc.com.ng/api/v2";
  private static readonly ACCESS_TOKEN =
    process.env.ALOC_ACCESS_TOKEN ?? "QB-67f029a456b64b041534";

  private static async fetchWithAuth(endpoint: string, options?: RequestInit) {
    const response = await fetch(`${this.API_URL}${endpoint}`, {
      ...options,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        AccessToken: this.ACCESS_TOKEN,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Get all supported subjects
  public static async getSubjects(): Promise<SubjectsResponse> {
    try {
      return await this.fetchWithAuth("/q-subjects");
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
      throw error;
    }
  }

  // Get years with comprehension for a subject
  public static async getComprehensionYears(
    subject: string,
  ): Promise<ComprehensionYearsResponse> {
    try {
      return await this.fetchWithAuth(
        `/q-comprehension-years?subject=${subject}`,
      );
    } catch (error) {
      console.error("Failed to fetch comprehension years:", error);
      throw error;
    }
  }

  // Get questions
  public static async getQuestions(params: {
    subject: string;
    type?: "utme" | "wassce" | "post-utme";
    year?: number;
  }): Promise<QuestionResponse[]> {
    try {
      let endpoint = `/q?subject=${params.subject}`;
      if (params.type) endpoint += `&type=${params.type}`;
      if (params.year) endpoint += `&year=${params.year}`;

      return await this.fetchWithAuth(endpoint);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
      throw error;
    }
  }

  // Report a question
  public static async reportQuestion(params: {
    subject: string;
    questionId: number;
    message?: string;
    fullName?: string;
    type?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  }): Promise<ReportResponse> {
    try {
      const formData = new URLSearchParams();
      formData.append("subject", params.subject);
      formData.append("question_id", params.questionId.toString());
      if (params.message) formData.append("message", params.message);
      if (params.fullName) formData.append("full_name", params.fullName);
      if (params.type) formData.append("type", params.type.toString());

      return await fetch(`${this.API_URL}/r`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          AccessToken: this.ACCESS_TOKEN,
        },
        body: formData,
      }).then((res) => res.json());
    } catch (error) {
      console.error("Failed to report question:", error);
      throw error;
    }
  }

  public static async getQuestionByYearsAndSubject(
    subject: string,
    year: string,
  ) {
    try {
      const response = await fetch(
        `${this.API_URL}/m/20?subject=${subject}&year=${year}&random=false`,
        {
          headers: {
            Accept: "application/json",
            AccessToken: this.ACCESS_TOKEN,
          },
        },
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch questions:", error);
      throw error;
    }
  }
  public static async getQuestionByExamType(examType: string, subject: string) {
    try {
      const response = await fetch(
        `${this.API_URL}/q?subject=${subject}&type=${examType}`,
        {
          headers: {
            Accept: "application/json",
            AccessToken: this.ACCESS_TOKEN,
          },
        },
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch questions by exam type:", error);
      throw error;
    }
  }
}

// async function main() {
//   const subjects = await AlocQuizService.getQuestionByYearsAndSubject(
//     "mathematics",
//     "2024",
//   );
//   console.log(subjects);
// }

// main().catch(console.error);
// // https://questions.aloc.com.ng/api/metrics/questions-available-for/english
