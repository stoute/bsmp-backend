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
  if (!message) return null;

  // Determine message type
  let type;
  if (message instanceof HumanMessage) {
    type = "human";
  } else if (message instanceof AIMessage) {
    type = "ai";
  } else if (message instanceof SystemMessage) {
    type = "system";
  } else if (message instanceof BaseMessage) {
    type = message._getType?.() || "ai";
  } else {
    return {
      type: "ai",
      content: String(message.content || ""),
      additional_kwargs: message.additional_kwargs || {},
    };
  }

  // Create a standardized JSON representation
  const result = {
    type,
    content: message.content,
    additional_kwargs: { ...message.additional_kwargs },
  };

  // Move deprecated metadata into additional_kwargs if it exists
  // if (message.metadata) {
  //   console.warn(
  //     "Using deprecated message.metadata - please use additional_kwargs.metadata instead",
  //   );
  //   result.additional_kwargs.metadata = {
  //     ...result.additional_kwargs.metadata,
  //     ...message.metadata,
  //   };
  // }
  //
  // // Move deprecated timestamp into additional_kwargs if it exists
  // if (message.timestamp) {
  //   console.warn(
  //     "Using deprecated message.timestamp - please use additional_kwargs.timestamp instead",
  //   );
  //   result.additional_kwargs.timestamp = message.timestamp;
  // }

  return result;
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
