package au.com.trafmon;

import java.io.File;
import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.db4o.Db4o;
import com.db4o.ObjectContainer;

public class Util {

	public static ObjectContainer openDb() {
		return Db4o.openFile(getFileName());
	}

	private static String getFileName() {
		if (System.getProperty("os.name").contains("Windows")) {
			return "C:\tmp\trafmon.db4o";
		} else {
			return "/tmp/trafmon.db4o";
		}
	}
	
	public static boolean deleteDB(){
		File f1 = new File(getFileName());

		return f1.delete();

	}

}
