import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";
import elastic from "@/lib/elasticsearch";

export async function POST(req: Request) {
  try {
    const { getUser } = getKindeServerSession();
    const currentUser = await getUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { query } = await req.json();
    if (!query) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 });
    }

    const esResponse = await elastic.search({
      index: "messages",
      query: {
        bool: {
          must: [
            {
              match: {
                content: {
                    query,
                    fuzziness: "AUTO"
                }
              },
            },
          ],
          filter: {
            term: { senderId: currentUser.id }, // Optional filter
          },
        },
      },
      size: 50,
    });

    const hits = esResponse.hits.hits.map((hit: any) => ({
      messageId: hit._id,
      ...hit._source,
    }));

    return NextResponse.json({ messages: hits });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}