package au.com.trafmon.sample;

import java.io.IOException;
import java.util.GregorianCalendar;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.db4o.ObjectContainer;
import com.db4o.query.Predicate;

import au.com.trafmon.DataPoint;
import au.com.trafmon.DataPointSet;
import au.com.trafmon.Util;

/**
 * Servlet implementation class DataGenerator
 */
public class DataGeneratorServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public DataGeneratorServlet() {
		super();
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		request.getRequestDispatcher("/WEB-INF/generateData.jsp").forward(request, response);
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

		String operation = request.getParameter("operation");

		if(operation.equalsIgnoreCase("delete")){

			if((Util.deleteDB()) == true){
				System.out.println("File deleted.");
			}else{
				System.out.println("Deletion failed.");
			}

			request.getRequestDispatcher("/WEB-INF/showData.jsp").forward(request, response);

		}else if(operation.equalsIgnoreCase("create")){

			ObjectContainer db = Util.openDb();
			try{
				DataPointSet dpSet = new DataPointSet();
				String type = (String)request.getParameter("data");

				if(type.equals("melbUni")){
					DataPoint dp1 = new DataPoint(-37.800098, 144.961077, 1, 5, null, new GregorianCalendar());
					DataPoint dp2 = new DataPoint(-37.800013, 144.960154, 2, 4, null, new GregorianCalendar());
					db.store(dp1);
					db.store(dp2);
				}

				List<DataPoint> list = db.query(new Predicate<DataPoint>() {
					public boolean match(DataPoint candidate) {
						return true;
					}
				});


				dpSet.setDataPoints(list);

				request.setAttribute("points", dpSet);

				request.getRequestDispatcher("/WEB-INF/showData.jsp").forward(request, response);	
			}finally{
				db.close();
			}
		}
	}
}
