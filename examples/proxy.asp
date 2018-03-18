<%
' This is a blind proxy that we use to get around browser
' restrictions that prevent the Javascript from loading pages not on the
' same server as the Javascript.  This has several problems: it's less
' efficient, it might break some sites, and it's a security risk because
' people can use this proxy to browse the web and possibly do bad stuff
' with it.  It only loads pages via http and https, but it can load any
' content type. It supports GET and POST requests.

On Error Resume Next

' Designed to prevent Open Proxy type stuff.
allowedHosts = Array("www.openlayers.org", "openlayers.org", _
	"labs.metacarta.com", "world.freemap.in", _
	"prototype.openmnnd.org", "geo.openplans.org", _
	"sigma.openplans.org", "demo.opengeo.org", _
	"www.openstreetmap.org","sample.azavea.com", _
	"v2.suite.opengeo.org", "v-swe.uni-muenster.de:8080", _
	"vmap0.tiles.osgeo.org", "www.openrouteservice.org", _
	"maps.wien.gv.at", ".*\.?google\.com")

set objHttp = Server.CreateObject("Msxml2.ServerXMLHTTP")

strURL = Request("url")
totalBytes = Request.TotalBytes
data = Request.BinaryRead(totalBytes)
method = Request.ServerVariables("REQUEST_METHOD")
contentType = Request.ServerVariables("CONTENT_TYPE")

host = GetHost(strURL)	
If TypeName(allowedHosts) <> "Nothing" And Not CheckHost(host, allowedHosts) Then
	Response.ContentType = "text/plain"
	Response.Status = 502
	Response.Write "Status: 502 Bad Gateway"
	Response.Write vbCrLF
	Response.Write "This proxy does not allow you to access that location (" & host & ")."	
ElseIf Left(strURL, 7) = "http://" Or Left(strURL, 8) = "https://" Then
	objHttp.open method, strURL, False
	If contentType <> "" Then
		objHttp.setRequestHeader "Content-Type", contentType
	End If
	objHttp.Send data

	If objHttp.status = 200 Then
		Response.Expires = 120
		Response.Status = 200
		Response.ContentType = objHttp.getResponseHeader("Content-Type")
		Response.BinaryWrite objHttp.responseBody
		set objHttp = Nothing
	End If
Else
	Response.ContentType = "text/plain"
	Response.Status = 200
	Response.Write "Illegal request."
End If

If Err.Number <> 0 then
	Response.ContentType = "text/plain"
	Response.Status = 500
	Response.Write "Status: 500 Unexpected Error"
	Response.Write vbCrLF
	Response.Write "Some unexpected error occurred. Error text was:" & Err.Description
	Error.Clear
End If


Function GetHost(url) 
	if instr(url, "//") > 0 then 
		urlParts = split(url,"/") 
		GetHost = urlParts(2) 
	else 
		GetHost = Nothing
	end if 
End Function 

Function CheckHost(host, a)
	For Each item in a		
		CheckHost = False
		If host = item Then
			CheckHost = True
			Exit For
		Else
			set objRegex = new RegExp
			objRegex.IgnoreCase = True
			objRegex.Pattern = item
			If objRegex.Test(host) Then
				CheckHost = True
				Exit For
			Else
				CheckHost = False
			End If
		End If
	Next	
End Function

%>