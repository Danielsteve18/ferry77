package com.ferry77.backend.service;

import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.ferry77.backend.dto.FileProcessingResponse;
import com.ferry77.backend.dto.QuickRequestDTO;

import java.io.IOException;
import java.io.InputStream;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class FileProcessingService {

    public List<FileProcessingResponse> processFiles(List<MultipartFile> files) {
        List<FileProcessingResponse> results = new ArrayList<>();
        
        for (MultipartFile file : files) {
            FileProcessingResponse response = processFile(file);
            results.add(response);
        }
        
        return results;
    }

    private FileProcessingResponse processFile(MultipartFile file) {
        String fileName = file.getOriginalFilename();
        String fileType = determineFileType(fileName);
        
        FileProcessingResponse response = new FileProcessingResponse(fileName, fileType, true);
        
        try {
            switch (fileType) {
                case "pdf":
                    response.setExtractedData(processPDF(file));
                    break;
                case "excel":
                    response.setExtractedData(processExcel(file));
                    break;
                case "image":
                    response.setExtractedData(processImage(file));
                    break;
                default:
                    response.setSuccess(false);
                    response.setError("Tipo de archivo no soportado");
            }
            
            // Generar items a partir de los datos extraídos
            response.setItems(generateItemsFromExtractedData(response.getExtractedData()));
            
        } catch (Exception e) {
            response.setSuccess(false);
            response.setError("Error al procesar archivo: " + e.getMessage());
        }
        
        return response;
    }

    private String determineFileType(String fileName) {
        if (fileName == null) return "unknown";
        
        String extension = fileName.toLowerCase();
        if (extension.endsWith(".pdf")) return "pdf";
        if (extension.endsWith(".xlsx") || extension.endsWith(".xls")) return "excel";
        if (extension.endsWith(".jpg") || extension.endsWith(".jpeg") || 
            extension.endsWith(".png") || extension.endsWith(".gif")) return "image";
        
        return "unknown";
    }

    private Map<String, Object> processPDF(MultipartFile file) throws IOException {
        // Simulación de procesamiento de PDF
        // En un escenario real, usarías librerías como Apache PDFBox
        Map<String, Object> extracted = new HashMap<>();
        extracted.put("type", "pdf");
        extracted.put("text", "Contenido extraído del PDF (simulado)");
        extracted.put("pages", 1);
        extracted.put("products", Arrays.asList(
            "Cemento Portland x 50kg",
            "Arena fina x m³",
            "Ladrillos comunes x 1000"
        ));
        return extracted;
    }

    private Map<String, Object> processExcel(MultipartFile file) throws IOException {
        System.out.println("⚙️ [FileProcessingService] Procesando archivo Excel: " + file.getOriginalFilename());
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> items = new ArrayList<>();

        try (InputStream inputStream = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(inputStream)) {

            Sheet sheet = workbook.getSheetAt(0); // Tomamos la primera hoja

            // Mapeo de cabeceras para encontrar las columnas correctas
            Map<String, Integer> headerMap = new HashMap<>();
            Row headerRow = sheet.getRow(0);
            if (headerRow != null) {
                for (Cell cell : headerRow) {
                    String header = cell.getStringCellValue().trim().toLowerCase();
                    if (header.contains("producto") || header.contains("nombre") || header.contains("item")) {
                        headerMap.put("name", cell.getColumnIndex());
                    } else if (header.contains("cantidad") || header.contains("cant.")) {
                        headerMap.put("quantity", cell.getColumnIndex());
                    } else if (header.contains("especificaciones") || header.contains("descripción") || header.contains("detalle")) {
                        headerMap.put("specifications", cell.getColumnIndex());
                    }
                }
            }

            System.out.println("📊 Cabeceras detectadas en Excel: " + headerMap);

            // Iterar sobre las filas, omitiendo la cabecera
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                Map<String, Object> item = new HashMap<>();

                // Extraer nombre del producto
                Integer nameIndex = headerMap.get("name");
                if (nameIndex != null && row.getCell(nameIndex) != null) {
                    item.put("producto", getCellValueAsString(row.getCell(nameIndex)));
                } else if (row.getCell(0) != null) { // Fallback a la primera columna
                    item.put("producto", getCellValueAsString(row.getCell(0)));
                }

                // Si no hay nombre, saltar la fila
                if (item.get("producto") == null || ((String)item.get("producto")).trim().isEmpty()) {
                    continue;
                }

                // Extraer cantidad
                Integer quantityIndex = headerMap.get("quantity");
                if (quantityIndex != null && row.getCell(quantityIndex) != null) {
                    item.put("cantidad", getCellValueAsInteger(row.getCell(quantityIndex)));
                } else if (row.getCell(1) != null) { // Fallback a la segunda columna
                    item.put("cantidad", getCellValueAsInteger(row.getCell(1)));
                } else {
                    item.put("cantidad", 1); // Cantidad por defecto
                }

                // Extraer especificaciones
                Integer specsIndex = headerMap.get("specifications");
                if (specsIndex != null && row.getCell(specsIndex) != null) {
                    item.put("especificaciones", getCellValueAsString(row.getCell(specsIndex)));
                } else if (row.getCell(2) != null) { // Fallback a la tercera columna
                    item.put("especificaciones", getCellValueAsString(row.getCell(2)));
                }

                items.add(item);
            }
        } catch (Exception e) {
            throw new IOException("Error al procesar el archivo Excel: " + e.getMessage(), e);
        }

        System.out.println("✅ [FileProcessingService] " + items.size() + " items extraídos del Excel.");
        result.put("type", "excel");
        result.put("sheets", 1); // Simplificado por ahora
        result.put("rows", items.size());
        result.put("products", items);
        return result;
    }

    private Map<String, Object> processImage(MultipartFile file) throws IOException {
        // Crear directorio de uploads si no existe
        String uploadDir = "uploads/images/";
        java.nio.file.Path uploadPath = java.nio.file.Paths.get(uploadDir);
        if (!java.nio.file.Files.exists(uploadPath)) {
            java.nio.file.Files.createDirectories(uploadPath);
        }
        
        // Generar nombre único para la imagen
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String uniqueFilename = System.currentTimeMillis() + "_" + UUID.randomUUID().toString() + extension;
        
        // Guardar la imagen
        java.nio.file.Path filePath = uploadPath.resolve(uniqueFilename);
        file.transferTo(filePath.toFile());
        
        // Crear URL accesible para la imagen
        String imageUrl = "/api/images/" + uniqueFilename;
        
        Map<String, Object> extracted = new HashMap<>();
        extracted.put("type", "image");
        extracted.put("size", file.getSize());
        extracted.put("originalName", originalFilename);
        extracted.put("imageUrl", imageUrl); // URL para acceder a la imagen
        extracted.put("description", "Imagen subida para análisis");
        extracted.put("products", Arrays.asList(
            "Productos identificados en imagen",
            "Materiales de construcción potenciales"
        ));
        return extracted;
    }

    private List<Map<String, Object>> generateItemsFromExtractedData(Map<String, Object> extractedData) {
        List<Map<String, Object>> items = new ArrayList<>();
        
        if (extractedData != null && extractedData.containsKey("products")) {
            @SuppressWarnings("unchecked")
            List<Object> productList = (List<Object>) extractedData.get("products");
            String imageUrl = (String) extractedData.get("imageUrl"); // Obtener la URL de la imagen si existe
            
            List<Object> productList = (List<Object>) extractedData.get("products");
            
            for (Object productObj : productList) {
                Map<String, Object> item = new HashMap<>();
                
                if (productObj instanceof String) {
                    // Para datos extraídos de texto o PDF
                    item.put("name", productObj);
                    item.put("quantity", 1);
                    item.put("specifications", "Extraído de archivo");
                } else if (productObj instanceof Map) {
                    // Para datos extraídos de Excel
                    @SuppressWarnings("unchecked")
                    Map<String, Object> productMap = (Map<String, Object>) productObj;
                    item.put("name", productMap.getOrDefault("producto", "Producto"));
                    item.put("quantity", productMap.getOrDefault("cantidad", 1));
                    item.put("specifications", productMap.getOrDefault("especificaciones", ""));
                }
                
                // Campos estándar para el frontend
                item.put("price", "");
                item.put("imageUrl", "");
                if (imageUrl != null && !imageUrl.isEmpty()) {
                    item.put("imageUrl", imageUrl); // Asignar la URL de la imagen al item
                }
                items.add(item);
            }
        }
        
        return items;
    }

    public Map<String, Object> extractInfoFromText(String description) {
        Map<String, Object> extracted = new HashMap<>();
        
        if (description == null || description.trim().isEmpty()) {
            return extracted;
        }
        
        // Extraer información básica del texto
        extracted.put("originalText", description);
        
        // Detectar posibles productos mencionados
        List<String> detectedProducts = extractProducts(description);
        extracted.put("detectedProducts", detectedProducts);
        
        // Detectar cantidades
        Map<String, Integer> quantities = extractQuantities(description);
        extracted.put("quantities", quantities);
        
        // Detectar profesión/tipo de trabajo
        String profession = detectProfession(description);
        extracted.put("suggestedProfession", profession);
        
        return extracted;
    }

    private List<String> extractProducts(String text) {
        List<String> products = new ArrayList<>();
        text = text.toLowerCase();
        
        // Palabras clave de productos comunes
        String[] keywords = {
            "cemento", "arena", "ladrillos", "cal", "yeso",
            "martillo", "destornillador", "taladro", "sierra", "nivel",
            "tuberías", "caños", "llaves", "grifos", "válvulas",
            "cables", "enchufes", "interruptores", "focos", "lámparas",
            "pintura", "rodillos", "pinceles", "diluyente", "masilla"
        };
        
        for (String keyword : keywords) {
            if (text.contains(keyword)) {
                products.add(keyword.substring(0, 1).toUpperCase() + keyword.substring(1));
            }
        }
        
        return products;
    }

    private Map<String, Integer> extractQuantities(String text) {
        Map<String, Integer> quantities = new HashMap<>();
        
        // Buscar patrones como "5 martillos", "10kg de cemento", etc.
        Pattern pattern = Pattern.compile("(\\d+)\\s*([a-záéíóúñ]+)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(text);
        
        while (matcher.find()) {
            int quantity = Integer.parseInt(matcher.group(1));
            String item = matcher.group(2);
            quantities.put(item, quantity);
        }
        
        return quantities;
    }

    private String detectProfession(String text) {
        text = text.toLowerCase();
        
        if (text.contains("baño") || text.contains("plomería") || text.contains("tuberías")) {
            return "plomería";
        } else if (text.contains("electricidad") || text.contains("cables") || text.contains("enchufes")) {
            return "electricidad";
        } else if (text.contains("pintura") || text.contains("pintar") || text.contains("rodillo")) {
            return "pintura";
        } else if (text.contains("construcción") || text.contains("cemento") || text.contains("ladrillos")) {
            return "construcción";
        } else if (text.contains("carpintería") || text.contains("madera") || text.contains("sierra")) {
            return "carpintería";
        }
        
        return "general";
    }

    public Map<String, Object> generateStructuredRequest(QuickRequestDTO requestData) {
        Map<String, Object> structuredRequest = new HashMap<>();
        
        // Información básica
        structuredRequest.put("title", generateTitle(requestData));
        structuredRequest.put("profession", requestData.getProfession() != null ? 
            requestData.getProfession() : detectProfession(requestData.getTextDescription()));
        structuredRequest.put("tipo", "herramienta"); // Default
        
        // Mejorar el manejo de ubicación
        String location = requestData.getLocation();
        if (location == null || location.trim().isEmpty() || 
            "Por definir".equals(location) || "Ubicación no especificada".equals(location)) {
            location = "Ubicación no especificada";
        }
        structuredRequest.put("location", location);
        
        structuredRequest.put("budget", "Por cotizar");
        
        // Generar items combinando texto y archivos
        List<Map<String, Object>> allItems = new ArrayList<>();
        
        // Items del texto
        if (requestData.getTextDescription() != null && !requestData.getTextDescription().trim().isEmpty()) {
            Map<String, Object> extractedFromText = extractInfoFromText(requestData.getTextDescription());
            @SuppressWarnings("unchecked")
            List<String> products = (List<String>) extractedFromText.get("detectedProducts");
            
            if (products != null && !products.isEmpty()) {
                for (String product : products) {
                    Map<String, Object> item = new HashMap<>();
                    item.put("name", product);
                    item.put("quantity", 1);
                    item.put("specifications", "Mencionado en descripción: " + requestData.getTextDescription());
                    item.put("price", "");
                    item.put("imageUrl", "");
                    allItems.add(item);
                }
            }
        }
        
        // Items de archivos
        if (requestData.getUploadedFiles() != null) {
            for (QuickRequestDTO.FileInfo fileInfo : requestData.getUploadedFiles()) {
                if (fileInfo.getExtractedData() != null) {
                    // Obtener URL de imagen si existe
                    String imageUrl = "";
                    if (fileInfo.getExtractedData().containsKey("imageUrl")) {
                        imageUrl = (String) fileInfo.getExtractedData().get("imageUrl");
                    }
                    
                    if (fileInfo.getExtractedData().containsKey("products")) {
                        @SuppressWarnings("unchecked")
                        List<Object> products = (List<Object>) fileInfo.getExtractedData().get("products");
                        
                        for (Object product : products) {
                            Map<String, Object> item = new HashMap<>();
                            if (product instanceof String) {
                                item.put("name", product);
                                item.put("quantity", 1);
                                item.put("specifications", "Extraído de " + fileInfo.getFileName());
                            }
                            item.put("price", "");
                            item.put("imageUrl", imageUrl); // Incluir URL de imagen
                            allItems.add(item);
                        }
                    } else if ("image".equals(fileInfo.getFileType()) && !imageUrl.isEmpty()) {
                        // Si es una imagen pero no tiene productos definidos, crear un item genérico
                        Map<String, Object> item = new HashMap<>();
                        item.put("name", "Productos en imagen: " + fileInfo.getFileName());
                        item.put("quantity", 1);
                        item.put("specifications", "Ver imagen adjunta para detalles");
                        item.put("price", "");
                        item.put("imageUrl", imageUrl);
                        allItems.add(item);
                    }
                }
            }
        }
        
        // Si no hay items, crear uno genérico
        if (allItems.isEmpty()) {
            Map<String, Object> genericItem = new HashMap<>();
            genericItem.put("name", "Productos solicitados");
            genericItem.put("quantity", 1);
            genericItem.put("specifications", requestData.getTextDescription() != null ? 
                requestData.getTextDescription() : "Especificaciones por definir");
            genericItem.put("price", "");
            genericItem.put("imageUrl", "");
            allItems.add(genericItem);
        }
        
        structuredRequest.put("items", allItems);
        structuredRequest.put("description", requestData.getTextDescription());
        
        return structuredRequest;
    }

    private String generateTitle(QuickRequestDTO requestData) {
        if (requestData.getTextDescription() != null && !requestData.getTextDescription().trim().isEmpty()) {
            String[] words = requestData.getTextDescription().trim().split("\\s+");
            if (words.length > 6) {
                return String.join(" ", Arrays.copyOf(words, 6)) + "...";
            } else {
                return requestData.getTextDescription().trim();
            }
        }
        
        return "Solicitud generada automáticamente";
    }

    // Métodos de ayuda para leer celdas de forma segura
    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        DataFormatter formatter = new DataFormatter();
        return formatter.formatCellValue(cell);
    }

    private int getCellValueAsInteger(Cell cell) {
        if (cell == null) return 1;
        try {
            switch (cell.getCellType()) {
                case NUMERIC:
                    // Evitar problemas con decimales
                    if (cell.getNumericCellValue() == (int) cell.getNumericCellValue()) {
                        return (int) cell.getNumericCellValue();
                    }
                    // Si tiene decimales, intentar convertir a entero, si no, devolver 1
                    try {
                        return Integer.parseInt(String.valueOf(Math.round(cell.getNumericCellValue())));
                    } catch (NumberFormatException e) {
                        return 1;
                    }
                case STRING:
                    // Intentar convertir string a número
                    try {
                        return Integer.parseInt(cell.getStringCellValue().trim());
                    } catch (NumberFormatException e) {
                        return 1; // Si no es un número, cantidad por defecto
                    }
                default:
                    return 1;
            }
        } catch (Exception e) {
            return 1; // Si hay cualquier error, cantidad por defecto
        }
    }
}