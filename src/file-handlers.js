// Dosya yükleme fonksiyonu
async function handleFileUpload(request, env, corsHeaders) {
  // Authorization kontrolü
  const isAuthorized = await authorize(request, env);
  if (!isAuthorized) {
    return createApiResponse(false, null, {
      code: "UNAUTHORIZED",
      message: "Bu işlem için yetkiniz yok"
    }, 401, corsHeaders);
  }
  
  try {
    // multipart/form-data içeren POST isteği
    if (request.method !== 'POST') {
      return createApiResponse(false, null, {
        code: "METHOD_NOT_ALLOWED",
        message: "Sadece POST istekleri kabul edilir"
      }, 405, corsHeaders);
    }
    
    // formData'dan dosyayı al
    const formData = await request.formData();
    const file = formData.get('file');
    const orderNumber = formData.get('orderNumber');
    
    if (!file) {
      return createApiResponse(false, null, {
        code: "BAD_REQUEST",
        message: "Dosya bulunamadı"
      }, 400, corsHeaders);
    }
    
    // Dosya kontrolleri
    const fileSize = file.size;
    const fileName = file.name;
    const fileExtension = fileName.split('.').pop().toLowerCase();
    
    // Dosya boyutu kontrolü (50MB'a kadar)
    if (fileSize > 50 * 1024 * 1024) {
      return createApiResponse(false, null, {
        code: "FILE_TOO_LARGE",
        message: "Dosya boyutu 50MB'ı geçemez"
      }, 400, corsHeaders);
    }
    
    // Dosya tipi kontrolü
    const allowedExtensions = ['dwg', 'dxf', 'step', 'stp', 'iges', 'igs', 'pdf', 'jpg', 'png'];
    if (!allowedExtensions.includes(fileExtension)) {
      return createApiResponse(false, null, {
        code: "INVALID_FILE_TYPE",
        message: "Geçersiz dosya türü. İzin verilen türler: " + allowedExtensions.join(', ')
      }, 400, corsHeaders);
    }
    
    // Benzersiz bir dosya adı oluştur
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileKey = `uploads/${orderNumber || 'order'}/${timestamp}-${randomString}-${fileName}`;
    
    // Dosyayı R2'ye yükle
    await env.FILE_BUCKET.put(fileKey, file.stream(), {
      httpMetadata: {
        contentType: file.type || 'application/octet-stream',
      },
    });
    
    // Başarılı yanıt
    return createApiResponse(true, {
      fileKey,
      fileName,
      fileSize,
      fileType: file.type,
      url: `/api/files/${fileKey}`
    }, null, 200, corsHeaders);
    
  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    return createApiResponse(false, null, {
      code: "UPLOAD_ERROR",
      message: "Dosya yüklenirken bir hata oluştu"
    }, 500, corsHeaders);
  }
}

// Dosya getirme fonksiyonu
async function getFile(fileKey, env, corsHeaders) {
  try {
    // R2'den dosyayı al
    const object = await env.FILE_BUCKET.get(fileKey);
    
    if (!object) {
      return createApiResponse(false, null, {
        code: "FILE_NOT_FOUND",
        message: "Dosya bulunamadı"
      }, 404, corsHeaders);
    }
    
    // Dosya içeriği ve meta veriler
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    
    // CORS ayarlarını ekle
    Object.entries(corsHeaders).forEach(([key, value]) => {
      headers.set(key, value);
    });
    
    return new Response(object.body, {
      headers
    });
  } catch (error) {
    console.error('Dosya getirme hatası:', error);
    return createApiResponse(false, null, {
      code: "RETRIEVE_ERROR",
      message: "Dosya getirilirken bir hata oluştu"
    }, 500, corsHeaders);
  }
}
