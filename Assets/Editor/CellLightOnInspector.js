@CustomEditor(CellLight)
class CellLightOnInspector extends Editor {
    override function OnInspectorGUI() {
        DrawDefaultInspector();
        //Debug.Log(target.name + ": " +
        //          (target.GetColor().r * 255) + "," +
        //          (target.GetColor().g * 255) + "," +
        //          (target.GetColor().b * 255));
        if (GUILayout.Button("Update"))
        {
        	for (var i = 0; i < target.CL_Color.length; i++)
        	{
        		for (var j = 0; j < target.cellNeighborCount; j++)
				{
					target.cellNeighbors[j].SetLightLevel(i, (target.CL_LightLevel[i]-1) / target.CL_LightRange[i], false);
				}
				target.ComputeColor();
        	}
        }
        if (GUILayout.Button("Update Forced"))
        {
        	for (i = 0; i < target.CL_Color.length; i++)
        	{
        		target.SetLightLevel(i,
        		target.CL_LightLevel[i] / target.CL_LightRange[i], true);
        	}
        }
    }
}