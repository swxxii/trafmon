package au.com.trafmon;

import com.db4o.Db4o;
import com.db4o.ObjectContainer;

public class Util {

	public static ObjectContainer openDb() {
		if (System.getProperty("os.name").contains("Windows")) {
			return Db4o.openFile("C:\tmp\trafmon.db4o");
		} else {
			return Db4o.openFile("/tmp/trafmon.db4o");
		}
	}

}
