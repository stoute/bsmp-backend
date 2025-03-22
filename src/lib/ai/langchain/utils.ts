import {
  BaseMessage,
  HumanMessage,
  AIMessage,
  SystemMessage,
} from "@langchain/core/messages";

// Function to serialize a BaseMessage object from JSON
export function serializeMessageFromJSON(jsonData) {
  if (!jsonData) {
    console.warn("Attempted to serialize null or undefined message");
    return null;
  }

  // Check the message type from the JSON
  const { type, content, additional_kwargs = {}, example = false } = jsonData;

  // Handle messages that are already instances of BaseMessage classes
  if (
    jsonData instanceof HumanMessage ||
    jsonData instanceof AIMessage ||
    jsonData instanceof SystemMessage
  ) {
    return jsonData;
  }

  // Determine message type if not explicitly provided
  let messageType = type;
  if (!messageType) {
    if (jsonData.role === "user") {
      messageType = "human";
    } else if (jsonData.role === "assistant") {
      messageType = "ai";
    } else if (jsonData.role === "system") {
      messageType = "system";
    } else {
      // Default to AI message if type cannot be determined
      console.warn("Unknown message type, defaulting to AI message:", jsonData);
      messageType = "ai";
    }
  }

  // Create the appropriate message based on type
  let message;
  switch (messageType) {
    case "human":
      message = new HumanMessage({ content: content || "" });
      break;
    case "ai":
      message = new AIMessage({ content: content || "", additional_kwargs });
      break;
    case "system":
      message = new SystemMessage({ content: content || "" });
      break;
    default:
      console.warn(
        `Unrecognized message type: ${messageType}, defaulting to AI message`,
      );
      message = new AIMessage({ content: content || "" });
  }

  // Handle example flag if needed
  if (example) {
    message._example = true;
  }

  return message;
}

// Example usage
// const jsonMessage = {
//     type: "human",
//     content: "Hello, how are you?",
//     example: false
// };
//
// const message = serializeMessageFromJSON(jsonMessage);
// console.log(message);

// Function to deserialize a BaseMessage object to JSON
export function deserializeMessageToJSON(message) {
  if (!message) {
    console.warn("Attempted to deserialize null or undefined message");
    return null;
  }
  // Check if it's already a plain object with a type property
  if (typeof message === "object" && !message.getType && message.type) {
    console.log("Message is already in JSON format:", message);
    return message;
  }
  // Determine message type
  let type;
  if (message instanceof HumanMessage) {
    type = "human";
  } else if (message instanceof AIMessage) {
    type = "ai";
  } else if (message instanceof SystemMessage) {
    type = "system";
  } else if (message instanceof BaseMessage) {
    type = "ai";
    // fixme:
    // For custom message types, use the _getType method or fall back to a default
    // type = message.getType?.() || message.additional_kwargs?.type;
    // type = message.additional_kwargs?.type;
    // type = "ai";
  } else {
    //console.warn("Unknown message type:", message);
    // Return a safe default instead of throwing an error
    return {
      type: "ai",
      content: String(message.content || ""),
      additional_kwargs: message.additional_kwargs || {},
      metadata: message.metadata || {},
    };
  }
  console.log("type", type);

  // Create JSON object with common properties
  const jsonData = {
    type,
    content: message.content,
  };
  // Add additional properties if they exist
  if (
    message.additional_kwargs &&
    Object.keys(message.additional_kwargs).length > 0
  ) {
    jsonData.additional_kwargs = message.additional_kwargs;
  }
  if (message.metadata) {
    jsonData.metadata = message.metadata;
  }
  if (message._example === true) {
    jsonData.example = true;
  }

  return jsonData;
}

// Function to serialize an array of messages
export function serializeMessagesFromJSON(jsonData) {
  return jsonData.map((msg) => serializeMessageFromJSON(msg));
}

// Function to deserialize an array of messages
export function deserializeMessagesToJSON(messages) {
  if (!Array.isArray(messages)) {
    console.warn("deserializeMessagesToJSON received non-array:", messages);
    return [];
  }

  return messages
    .map((msg) => {
      try {
        return deserializeMessageToJSON(msg);
      } catch (err) {
        console.error("Error deserializing message:", msg, err);
        return null;
      }
    })
    .filter(Boolean); // Remove any null results
}

// Example usage
// const humanMessage = new HumanMessage({
//     content: "Hello, how are you?"
// });
//
// const aiMessage = new AIMessage({
//     content: "I'm doing well, thanks for asking!",
//     additional_kwargs: { foo: "bar" }
// });
//
// const systemMessage = new SystemMessage({
//     content: "You are a helpful assistant."
// });
//
// // Deserialize single message
// const jsonHuman = deserializeMessageToJSON(humanMessage);
// console.log(jsonHuman);
//
// // Deserialize multiple messages
// const messages = [systemMessage, humanMessage, aiMessage];
// const jsonMessages = deserializeMessagesToJSON(messages);
// console.log(JSON.stringify(jsonMessages, null, 2));
