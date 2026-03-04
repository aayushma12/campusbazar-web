import api from "./api";

export interface TutorRequest {
    _id: string;
    studentId: {
        _id: string;
        name: string;
        profilePicture?: string;
        university?: string;
        campus?: string;
    };
    tutorId?: string;
    subject: string;
    topic: string;
    description: string;
    preferredTime: string;
    status: 'pending' | 'accepted' | 'completed';
    createdAt: string;
}

export const createTutorRequest = async (data: {
    subject: string;
    topic: string;
    description: string;
    preferredTime: string;
}) => {
    const response = await api.post("/tutor/request", data);
    return response.data;
};

export const getAvailableTutorRequests = async (): Promise<TutorRequest[]> => {
    const response = await api.get("/tutor/available");
    return response.data.data;
};

export const getMyTutorRequests = async (): Promise<TutorRequest[]> => {
    const response = await api.get("/tutor/my-requests");
    return response.data.data;
};

export const acceptTutorRequest = async (requestId: string) => {
    const response = await api.post(`/tutor/accept/${requestId}`);
    return response.data;
};
