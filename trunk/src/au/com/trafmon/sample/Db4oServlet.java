package au.com.trafmon.sample;

import java.io.IOException;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import au.com.trafmon.Util;

import com.db4o.Db4o;
import com.db4o.ObjectContainer;
import com.db4o.query.Predicate;

/**
 * Servlet implementation class Db4oServlet
 */
public class Db4oServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
	ObjectContainer db;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public Db4oServlet() {
		super();
		db = Util.openDb();
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		String to = request.getParameter("to");

		if (to != null) {
			if(to.equalsIgnoreCase("load")){
				
				//We are headed for the 'load' page
				List<Pilot> list = db.query(new Predicate<Pilot>() {
					public boolean match(Pilot candidate) {
						return true;
					}
				});

				request.setAttribute("pilots", list);
				request.getRequestDispatcher("/WEB-INF/db4oExampleLoad.jsp").forward(
						request, response);
				
			}else{
				//We should not be here!
			}
		} else {

			//We are coming in for the first time
			request.getRequestDispatcher("/WEB-INF/db4oExampleSave.jsp").forward(
					request, response);
		}
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
			String name = (String)request.getParameter("name");
			db.store(new Pilot(name, 0));
			request.getRequestDispatcher("/WEB-INF/db4oExampleSave.jsp").forward(
					request, response);
	}

}
