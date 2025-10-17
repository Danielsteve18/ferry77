package com.ferry77.backend.service;

import com.ferry77.backend.model.ItemSolicitud;
import com.ferry77.backend.model.Solicitud;
import com.ferry77.backend.model.Usuario;
import com.ferry77.backend.repository.SolicitudRepository;
import com.ferry77.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class QuickRequestService {

    @Autowired
    private SolicitudRepository solicitudRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private UserService userService;

    @Transactional
    public Solicitud saveQuickRequest(Map<String, Object> payload) {
        System.out.println("⚙️ [QuickRequestService] Guardando solicitud rápida...");

        String usuarioId = (String) payload.get("usuarioId");
        String usuarioNombre = (String) payload.get("usuarioNombre");
        String usuarioEmail = (String) payload.get("usuarioEmail");
        @SuppressWarnings("unchecked")
        Map<String, Object> requestData = (Map<String, Object>) payload.get("requestData");

        if (usuarioId == null || usuarioId.trim().isEmpty()) {
            throw new IllegalArgumentException("El ID de usuario es obligatorio");
        }

        if (requestData == null) {
            throw new IllegalArgumentException("Los datos de la solicitud son obligatorios");
        }

        String userLocation = userService.getUserLocation(usuarioId);
        String userName = userService.getUserName(usuarioId);
        String userEmailFromDb = userService.getUserEmail(usuarioId);
        String userPhone = userService.getUserPhone(usuarioId);

        Solicitud solicitud = new Solicitud();
        solicitud.setUsuarioId(usuarioId);

        String nombreFinal = (usuarioNombre == null || usuarioNombre.trim().isEmpty() || "Usuario".equals(usuarioNombre)) ? userName : usuarioNombre;
        if (nombreFinal == null || nombreFinal.trim().isEmpty() || "Usuario".equals(nombreFinal)) {
            Usuario usuario = usuarioRepository.findByFirebaseUid(usuarioId);
            nombreFinal = (usuario != null && usuario.getNombreCompleto() != null && !usuario.getNombreCompleto().trim().isEmpty()) ? usuario.getNombreCompleto() : "Usuario Anónimo";
        }
        solicitud.setUsuarioNombre(nombreFinal);

        String emailFinal = (usuarioEmail == null || usuarioEmail.trim().isEmpty()) ? userEmailFromDb : usuarioEmail;
        solicitud.setUsuarioEmail(emailFinal);
        solicitud.setTelefono(userPhone);

        solicitud.setTitulo((String) requestData.get("title"));
        solicitud.setProfesion((String) requestData.get("profession"));
        solicitud.setTipo((String) requestData.get("tipo"));

        String locationFromRequest = (String) requestData.get("location");
        String ubicacionFinal = (locationFromRequest == null || locationFromRequest.trim().isEmpty() || "Por definir".equals(locationFromRequest) || "Ubicación no especificada".equals(locationFromRequest)) ? userLocation : locationFromRequest;
        solicitud.setUbicacion(ubicacionFinal);

        String presupuestoStr = (String) requestData.get("budget");
        if (presupuestoStr != null && !presupuestoStr.trim().isEmpty() && !presupuestoStr.equals("Por cotizar")) {
            try {
                solicitud.setPresupuesto(Double.parseDouble(presupuestoStr.replace("$", "").replace(",", "").trim()));
            } catch (NumberFormatException e) {
                solicitud.setPresupuesto(null);
            }
        } else {
            solicitud.setPresupuesto(null);
        }

        solicitud.setEstado("pendiente");

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> itemsData = (List<Map<String, Object>>) requestData.get("items");
        if (itemsData != null && !itemsData.isEmpty()) {
            List<ItemSolicitud> items = itemsData.stream().map(itemData -> {
                ItemSolicitud item = new ItemSolicitud();
                item.setNombre((String) itemData.get("name"));
                Object quantity = itemData.get("quantity");
                item.setCantidad(quantity instanceof Integer ? (Integer) quantity : 1);
                item.setEspecificaciones((String) itemData.get("specifications"));
                item.setImagenUrl((String) itemData.get("imageUrl"));
                String precioStr = (String) itemData.get("price");
                if (precioStr != null && !precioStr.trim().isEmpty()) {
                    try {
                        item.setPrecio(Double.parseDouble(precioStr.replace("$", "").replace(",", "").trim()));
                    } catch (NumberFormatException e) {
                        item.setPrecio(null);
                    }
                }
                return item;
            }).collect(Collectors.toList());
            solicitud.setItems(items);
        }

        return solicitudRepository.save(solicitud);
    }
}