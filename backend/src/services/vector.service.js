// Import the Pinecone library
const { Pinecone } =  require('@pinecone-database/pinecone')

// Initialize a Pinecone client with your API key
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const myChatgptIndex = pc.index('mychatgpt')

async function createMemory({vectors,metadata,messageId}) {
    
    await myChatgptIndex.upsert([{
        id:messageId,
        values:vectors,
        metadata
    }])
}

async function queryMemory({queryVector,limit,metadata}) {
    
    const data = await myChatgptIndex.query({
        vector:queryVector,
        topK:limit,
        filter:metadata ? metadata : undefined,
        includeMetadata:true
    })

    return data.matches

}

module.exports = {createMemory, queryMemory}