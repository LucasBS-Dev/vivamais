package br.edu.vivamais;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Set;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ReadListener;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ProblemDetail;
import org.springframework.web.filter.OncePerRequestFilter;

/** Foundation JSON requests are small. Future file uploads must use an explicit, bounded flow. */
final class RequestBodyLimitFilter extends OncePerRequestFilter {
    static final int MAX_BYTES=8192;
    private static final Set<String> BODY_METHODS=Set.of("POST","PUT","PATCH","DELETE");
    private final ObjectMapper mapper;
    RequestBodyLimitFilter(ObjectMapper mapper) { this.mapper=mapper; }
    @Override protected void doFilterInternal(HttpServletRequest request,HttpServletResponse response,FilterChain chain)
            throws IOException,ServletException {
        if (!BODY_METHODS.contains(request.getMethod())) { chain.doFilter(request,response); return; }
        if (request.getMethod().equals("POST") && request.getRequestURI().matches("/api/v1/patients/[a-fA-F0-9-]{36}/files") && request.getContentType()!=null && request.getContentType().startsWith("multipart/form-data")) {
            // Servlet multipart resolver enforces 2 MB file / 3 MB total, including chunked requests.
            if(request.getContentLengthLong()>3145728){reject(response);return;}chain.doFilter(request,response);return;
        }
        int limit=request.getRequestURI().startsWith("/api/v1/auth/")?MAX_BYTES:32768;
        if (request.getContentLengthLong()>limit) { reject(response); return; }
        // Read at most MAX+1 even for chunked requests with no Content-Length header.
        byte[] bytes=request.getInputStream().readNBytes(limit+1);
        if (bytes.length>limit) { reject(response); return; }
        var stream=new ByteArrayInputStream(bytes);
        HttpServletRequestWrapper bounded=new HttpServletRequestWrapper(request) {
            private final ServletInputStream input=new ServletInputStream() {
                @Override public boolean isFinished() { return stream.available()==0; }
                @Override public boolean isReady() { return true; }
                @Override public void setReadListener(ReadListener listener) { throw new UnsupportedOperationException("Synchronous API only"); }
                @Override public int read() { return stream.read(); }
                @Override public int read(byte[] buffer,int offset,int length) { return stream.read(buffer,offset,length); }
            };
            @Override public ServletInputStream getInputStream() { return input; }
            @Override public int getContentLength() { return bytes.length; }
            @Override public long getContentLengthLong() { return bytes.length; }
        };
        chain.doFilter(bounded,response);
    }
    private void reject(HttpServletResponse response) throws IOException {
        var problem=ProblemDetail.forStatus(413);
        problem.setTitle("Solicitação muito grande"); problem.setDetail("O corpo da solicitação excede o limite permitido.");
        response.setStatus(413); response.setContentType("application/problem+json");
        mapper.writeValue(response.getOutputStream(),problem);
    }
}
