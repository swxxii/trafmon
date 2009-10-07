package au.com.trafmon.sample;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.db4o.Db4o;
import com.db4o.ObjectContainer;
import com.db4o.query.Predicate;

/**
 * Servlet implementation class Db4oServlet
 */
public class Db4oServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
	ObjectContainer db;
	List<Pilot> pilots;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public Db4oServlet() {
        super();
        db = Db4o.openFile("db4oTest.db4o");
		pilots = new ArrayList<Pilot>();
        createPilots();
        storePilots();
    }

	private void storePilots() {

		Iterator<Pilot> iter = pilots.iterator();
		
		while(iter.hasNext()){
			db.store(iter.next());
		}
		
		
	}

	private void createPilots() {
		
		Pilot pilot1=new Pilot("Michael Schumacher",100);
		Pilot pilot2=new Pilot("Rubens Barrichello",99);
		
		pilots.add(pilot1);
		pilots.add(pilot2);
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String name = null;
		
		
		List<Pilot> list = db.query(new Predicate<Pilot>() {
			public boolean match(Pilot candidate) {
				return candidate.getPoints() == 99;
			}
		});
		
		if(list.size() > 0){
			name = list.get(0).getName();
		}
		
		request.setAttribute("pilot1.name", name);
		request.getRequestDispatcher("/WEB-INF/db4oExample.jsp").forward(request, response);
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
	}

}
