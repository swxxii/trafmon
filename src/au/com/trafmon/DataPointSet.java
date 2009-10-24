package au.com.trafmon;

import java.util.ArrayList;
import java.util.List;

public class DataPointSet {
	
	private List<DataPoint> dataPoints;
	
	public DataPointSet(){
		dataPoints = new ArrayList<DataPoint>();
	}

	public List<DataPoint> getDataPoints() {
		return dataPoints;
	}
	
	public void addDataPoint(DataPoint dataPoint){
		this.dataPoints.add(dataPoint);
	}

	public void setDataPoints(List<DataPoint> dataPoints) {
		this.dataPoints = dataPoints;
	}

}
