import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Tutor Dashboard | CampusBazar",
    description: "Request help from fellow students or offer your expertise as a tutor. Connect and learn together at CampusBazar.",
};

export default function TutorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
