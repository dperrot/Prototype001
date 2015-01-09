@CustomEditor(CornerPoint)
class CornerPointOnInspector extends Editor {
    override function OnInspectorGUI() {
        DrawDefaultInspector();
        //Debug.Log(target.name + ": " +
        //          (target.GetColor().r * 255) + "," +
        //          (target.GetColor().g * 255) + "," +
        //          (target.GetColor().b * 255));
    }
}