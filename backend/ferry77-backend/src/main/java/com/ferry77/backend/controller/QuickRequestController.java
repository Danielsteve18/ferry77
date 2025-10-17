package com.ferry77.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.ferry77.backend.service.QuickRequestService;
import org.springframework.web.multipart.MultipartFile;
import com.ferry77.backend.service.FileProcessingService;
import com.ferry77.backend.service.UserService;
import com.ferry77.backend.dto.FileProcessingResponse;
import com.ferry77.backend.dto.QuickRequestDTO;
import com.ferry77.backend.dto.SolicitudDTO;
import com.ferry77.backend.model.Solicitud;
import com.ferry77.backend.model.ItemSolicitud;
import com.ferry77.backend.model.Usuario;
import com.ferry77.backend.repository.SolicitudRepository;
import com.ferry77.backend.repository.UsuarioRepository;
import com.ferry77.backend.service.NotificationService;
import com.ferry77.backend.dto.NotificationDTO;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/quick-request")
@CrossOrigin(origins = "*")
public class QuickRequestController {

    @Autowired
    private FileProcessingService fileProcessingService;
    
    @Autowired
    private QuickRequestService quickRequestService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private SolicitudRepository solicitudRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private NotificationService notificationService;

    @PostMapping("/upload-files")
    public ResponseEntity<?> uploadFiles(@RequestParam("files") List<MultipartFile> files) {
        try {
            List<FileProcessingResponse> results = fileProcessingService.processFiles(files);
            return ResponseEntity.ok(Map.of("success", true, "results", results));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/generate-request")
    public ResponseEntity<?> generateRequest(@RequestBody QuickRequestDTO requestData) {
        try {
            // Obtener información del usuario desde la base de datos
            if (requestData.getUserId() != null && !requestData.getUserId().trim().isEmpty()) {
                String userLocation = userService.getUserLocation(requestData.getUserId());
                String userName = userService.getUserName(requestData.getUserId());
                String userEmail = userService.getUserEmail(requestData.getUserId());
                String userPhone = userService.getUserPhone(requestData.getUserId());
                
                // Si no se especificó ubicación en la request o es un valor por defecto, usar la del usuario
                if (requestData.getLocation() == null || requestData.getLocation().trim().isEmpty() || 
                    "Por definir".equals(requestData.getLocation()) || 
                    "Ubicación no especificada".equals(requestData.getLocation())) {
                    requestData.setLocation(userLocation);
                }
                
                // Actualizar nombre de usuario si no se proporcionó
                if (requestData.getUserName() == null || requestData.getUserName().trim().isEmpty() ||
                    "Usuario".equals(requestData.getUserName())) {
                    requestData.setUserName(userName);
                }
                
                // Actualizar email de usuario si no se proporcionó
                if (requestData.getUserEmail() == null || requestData.getUserEmail().trim().isEmpty()) {
                    requestData.setUserEmail(userEmail);
                }
                
                // Siempre establecer el teléfono (puede ser null)
                requestData.setUserPhone(userPhone);
            }
            
            Map<String, Object> generatedRequest = fileProcessingService.generateStructuredRequest(requestData);
            return ResponseEntity.ok(Map.of("success", true, "request", generatedRequest));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/process-text")
    public ResponseEntity<?> processText(@RequestBody Map<String, String> payload) {
        try {
            String description = payload.get("description");
            Map<String, Object> extractedInfo = fileProcessingService.extractInfoFromText(description);
            return ResponseEntity.ok(Map.of("success", true, "extracted", extractedInfo));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/save-request")
    public ResponseEntity<?> saveQuickRequest(@RequestBody Map<String, Object> payload) {
        try {
            Solicitud solicitudGuardada = quickRequestService.saveQuickRequest(payload);
            System.out.println("✅ [QuickRequestController] Solicitud rápida guardada con ID: " + solicitudGuardada.getId());
            
            // Enviar notificación
            NotificationDTO notification = new NotificationDTO(
                "Solicitud rápida creada",
                "Su solicitud se ha creado con éxito usando el modo rápido. Pronto algún negocio se comunicará con usted.",
                "quick_request_created",
                Map.of("solicitudId", String.valueOf(solicitudGuardada.getId()))
            );
            notificationService.sendToUserTopic(solicitudGuardada.getUsuarioId(), notification);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Solicitud rápida creada exitosamente");
            response.put("solicitud", solicitudGuardada);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "error", e.getMessage()));
            
        } catch (Exception e) {
            System.err.println("❌ [QuickRequestController] ERROR al guardar solicitud rápida:");
            System.err.println("    - Mensaje: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.internalServerError()
                .body(Map.of("success", false, "error", "Error interno del servidor: " + e.getMessage()));
        }
    }
}