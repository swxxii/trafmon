package au.com.trafmon.sample;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet implementation class SnoopServlet
 */
public class SnoopServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public SnoopServlet() {
		super();
		// TODO Auto-generated constructor stub
	}

	public void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		String userAgent = request.getHeader("user-agent");
		String clientBrowser = "Not known!";
		if (userAgent != null)
			clientBrowser = userAgent;
		request.setAttribute("client.browser", clientBrowser);
		request.getRequestDispatcher("/WEB-INF/showBrowser.jsp").forward(request, response);
	}

}
