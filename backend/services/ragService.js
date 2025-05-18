const Document = require("../models/Document");
const DocumentVersion = require("../models/DocumentVersion");
const fs = require("fs").promises;
const path = require("path");
const logger = require("../utils/logger");

// Mock document content cache (in a real implementation, this would be a vector database)
const documentContentCache = new Map();

/**
 * Mock function to extract text from a document file
 * In a real implementation, this would use proper document parsing libraries
 */
async function extractTextFromFile(filePath) {
  try {
    // For demonstration purposes, we'll just read the first few KB of the file
    // In a real implementation, you would use proper document parsing based on file type
    const buffer = await fs.readFile(filePath, { encoding: "utf8", flag: "r" });
    return buffer.slice(0, 5000); // Just take the first 5000 chars for demo
  } catch (error) {
    logger.error(`Error extracting text from file ${filePath}:`, error);
    return ""; // Return empty string if file can't be read
  }
}

/**
 * Mock function to index a document
 * In a real implementation, this would create embeddings and store them in a vector database
 */
async function indexDocument(documentId) {
  try {
    const document = await Document.findById(documentId).populate(
      "createdBy",
      "firstName lastName"
    );

    if (!document || document.isDeleted) {
      return { success: false, message: "Document not found or deleted" };
    }

    // Get the latest version
    const latestVersion = await DocumentVersion.findOne({ documentId })
      .sort({ versionNumber: -1 })
      .limit(1);

    if (!latestVersion) {
      return { success: false, message: "No versions found for this document" };
    }

    // Extract text from the document file
    const filePath = latestVersion.filePath;
    const text = await extractTextFromFile(filePath);

    // In a real implementation, you would create embeddings here
    // For our mock implementation, we'll just store the text
    documentContentCache.set(documentId.toString(), {
      id: documentId.toString(),
      title: document.title,
      content: text,
      metadata: {
        author: document.createdBy
          ? `${document.createdBy.firstName} ${document.createdBy.lastName}`
          : "Unknown",
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
        tags: document.tags,
      },
    });

    return { success: true, message: "Document indexed successfully" };
  } catch (error) {
    logger.error(`Error indexing document ${documentId}:`, error);
    return {
      success: false,
      message: "Error indexing document",
      error: error.message,
    };
  }
}

/**
 * Mock function to search for relevant document excerpts
 * In a real implementation, this would perform vector similarity search
 */
async function searchDocuments(query, userId, limit = 3) {
  try {
    // Get all documents the user has access to
    const documents = await Document.find({
      isDeleted: false,
    });

    const documentIds = documents.map((doc) => doc._id.toString());

    // Ensure all documents are indexed
    for (const docId of documentIds) {
      if (!documentContentCache.has(docId)) {
        await indexDocument(docId);
      }
    }

    // Mock search by looking for query terms in the document content
    // In a real implementation, this would be a vector similarity search
    const results = [];
    const queryTerms = query.toLowerCase().split(/\s+/);

    for (const docId of documentIds) {
      const docData = documentContentCache.get(docId);
      if (!docData) continue;

      const content = docData.content.toLowerCase();

      // Calculate a simple relevance score based on term frequency
      let score = 0;
      for (const term of queryTerms) {
        const regex = new RegExp(term, "gi");
        const matches = content.match(regex);
        if (matches) {
          score += matches.length;
        }
      }

      if (score > 0) {
        // Find excerpts containing query terms
        const excerpts = [];
        const contentLines = docData.content.split(/\n+/);

        for (const line of contentLines) {
          if (queryTerms.some((term) => line.toLowerCase().includes(term))) {
            excerpts.push(line.trim());
            if (excerpts.length >= 2) break; // Limit to 2 excerpts per document
          }
        }

        results.push({
          documentId: docId,
          title: docData.title,
          score,
          excerpts,
          metadata: docData.metadata,
        });
      }
    }

    // Sort by relevance score and limit results
    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  } catch (error) {
    logger.error(`Error searching documents:`, error);
    return [];
  }
}

/**
 * Mock function to generate an answer based on document excerpts
 * In a real implementation, this would use an LLM like GPT-4
 */
function generateAnswer(query, searchResults) {
  // If no relevant documents found
  if (searchResults.length === 0) {
    return {
      answer:
        "I couldn't find any relevant information in your documents to answer this question.",
      confidence: "low",
    };
  }

  // Mock answer generation based on search results
  // In a real implementation, this would use an LLM
  const combinedExcerpts = searchResults
    .flatMap((result) => result.excerpts)
    .join(" ");

  // Very simple mock answer generation
  const queryLower = query.toLowerCase();
  let answer;
  let confidence;

  if (combinedExcerpts.length > 200) {
    // Generate a mock answer based on the excerpts
    if (
      queryLower.includes("what") ||
      queryLower.includes("explain") ||
      queryLower.includes("describe")
    ) {
      answer = `Based on your documents, ${combinedExcerpts.substring(
        0,
        150
      )}...`;
      confidence = "medium";
    } else if (queryLower.includes("how") || queryLower.includes("process")) {
      answer = `The process involves: ${combinedExcerpts.substring(0, 150)}...`;
      confidence = "medium";
    } else if (
      queryLower.includes("when") ||
      queryLower.includes("date") ||
      queryLower.includes("time")
    ) {
      // Look for date patterns in the excerpts
      const dateMatch = combinedExcerpts.match(
        /\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}-\d{1,2}-\d{2,4}|\w+ \d{1,2}, \d{4}/
      );
      answer = dateMatch
        ? `According to your documents, the date is ${dateMatch[0]}.`
        : `I found information but couldn't identify a specific date in the context.`;
      confidence = dateMatch ? "high" : "low";
    } else {
      answer = `I found this in your documents: ${combinedExcerpts.substring(
        0,
        200
      )}...`;
      confidence = "medium";
    }
  } else {
    answer =
      "I found some information but it may not fully answer your question. Please try to be more specific or upload more relevant documents.";
    confidence = "low";
  }

  return { answer, confidence };
}

/**
 * Main function to answer a question using RAG
 */
async function answerQuestion(question, userId) {
  try {
    // 1. Search for relevant documents
    const searchResults = await searchDocuments(question, userId);

    // 2. Generate an answer based on the search results
    const { answer, confidence } = generateAnswer(question, searchResults);

    // 3. Return the answer and search results
    return {
      question,
      answer,
      confidence,
      sources: searchResults.map((result) => ({
        documentId: result.documentId,
        title: result.title,
        excerpts: result.excerpts,
        metadata: result.metadata,
      })),
    };
  } catch (error) {
    logger.error(`Error answering question:`, error);
    return {
      question,
      answer:
        "Sorry, I encountered an error while trying to answer your question.",
      confidence: "none",
      sources: [],
    };
  }
}

module.exports = {
  indexDocument,
  answerQuestion,
};
