import ChatBox from "../../components/ChatBox";

export default function ReflectionsPage() {
  // In a real app, civicId + token would come from login/session
  const civicId = "demo-user-001";
  const token = "replace-with-auth-token";

  return (
    <main style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem" }}>
      <h1>🪞 Reflections</h1>
      <p className="intro">
        Write your thoughts, talk with your companion, and anchor them into memory + ledger.
      </p>
      <ChatBox civicId={civicId} token={token} companion="jade" />
    </main>
  );
}
