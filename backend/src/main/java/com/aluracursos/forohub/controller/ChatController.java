package com.aluracursos.forohub.controller;

import com.aluracursos.forohub.dto.ChatMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Controller
public class ChatController {

    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public-chat")
    public ChatMessage sendMessage(ChatMessage message) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm"));
        return new ChatMessage(message.sender(), message.content(), timestamp);
    }
}
