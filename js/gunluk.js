var apiUrl = "https://notapi.selcukaltas.site/";
var pathname = window.location.pathname;
(function () {
	var notes, count = 0;
    var _private = { 
        addNewNote: function(not) {
	

				notes.append("<li><div class='notlar'><i class='icon-check' data-not-id='"+not.Id+"'>  Kaydet</i><p class='time'>" + tarihBicimlendir(not.NotZamani) + "</p>" + "<textarea id='baslik-"+not.Id+"'  class='note-title' placeholder='Baslik Gir...'  maxlength='50'/>" + "<textarea id='icerik-"+not.Id+"' class='note-content'  placeholder='Not Yaz..'/>" + "<i  class='icon-cancel hide' > NotuSil</i>" + "</div></li>");
				 							
				var newNote = notes.find("li:last");
				newNote.find(".icon-cancel").on('click', function(){
				    newNote.remove();
				});	
        },
        loadNotes: function() {
		    var localNotes = localStorage.getItem("notes");
		    if ( localNotes ) {
		        var notesList = JSON.parse(localNotes);
		  		count = notesList.length;
		        var i;
		        for (i = 0; i < count; i++) {
		            var storedNote = notesList[i];
		            _private.addNewNote(storedNote.Class, storedNote.Title, storedNote.Content, storedNote.Time);
		        }
		        $('#controls strong').hide();
		        $('#welcome').html('Welcome back!')
		    }
		}      
    };	

    $(document).ready(function() {
		notes = $('#notes-list');
    	notlariListele()
		$("#btnNew").click(function () {
			$.ajax({
				type: "Post",
				url:apiUrl+"api/Notlar/Ekle",
				headers: getAuthHeaders(),
				data: { Icerik: "" },
				success: function (data) {
					toastr.success("Notunuz başarıyla eklendi.")
					_private.addNewNote(data);
				},
				error: function (xhr, error, status) {
					toastr.error("Notunuz eklenirken hata oluştu.")
					console.log(xhr)
				}
			})
	    	var t = 1;
	    });
    });

    return {}
})();

function getAccessToken() {
    var loginDataJson = sessionStorage["login"] || localStorage["login"];
    var loginData;
    try {
        loginData = JSON.parse(loginDataJson);
    } catch (error) {
        return null;
    }

    if (!loginData || !loginData.access_token) {
        return null;
    }

    return loginData.access_token;
}

function getAuthHeaders() {
    return { Authorization: "Bearer " + getAccessToken() };
}
$("body").on("click", "[data-not-id]", function (event) {
	var notId = $(this).data("not-id");

    $.ajax({
        type: "put",
        url: apiUrl + "api/Notlar/NotGuncelle/" + notId,
        headers: getAuthHeaders(),
        data: {NotId:notId,Baslik: $("#baslik-"+notId).val(),Icerik:$("#icerik-"+notId).val()},
		success: function (data) {
            toastr.success("Notunuz başarıyla kaydedildi.")

        },
        error: function (xhr, status, error) {
            console.log("not güncellenemedi");
        }
    });
});
function notlariListele() {
    $.ajax({
        type: "get",
        headers: getAuthHeaders(),
        url: apiUrl + "api/Notlar/Listele",
		success: function (data) {
			
			notlariTabloyaEkle(data);
        },
        error: function () {

        }
    });
}
function notlariTabloyaEkle(notlar) {
    for (var i = 0; i < notlar.length; i++) {
        notuDuvaraEkle(notlar[i]);
    }
}

function notuDuvaraEkle(not) {
	var html = "<li><div class='notlar'><i class='icon-check' data-not-id='" + not.Id + "'>  Kaydet</i><p class='time'>" + tarihBicimlendir(not.NotZamani) + "</p>" + "<textarea id='baslik-"+not.Id+"' class='note-title' name='Baslik' value='"+not.Baslik+"' placeholder='Baslik Gir...' maxlength='50'>"+(not.Baslik ? not.Baslik : "")+"</textarea>"+ "<textarea id='icerik-"+not.Id+"' class='note-content'  value='"+not.Icerik+"'placeholder='Not Yaz...'>" +(not.Icerik ? not.Icerik : "")  +"</textarea>" + "<i class='icon-cancel hide'  data-delete-id='" + not.Id + "'> NotuSil</i>" + "</div></li>"
	$('#notes-list').append(html);
	
}
$("body").on("click", "[data-delete-id]", function (event) {
	var deleteId = $(this).data("delete-id");
	$.ajax({
		type: "DELETE",
		url: apiUrl + "api/Notlar/Delete/" + deleteId,
		headers: getAuthHeaders(),
		success: function (data) {
			toastr.success("Notunuz başarıyla silindi.")
			$("#notes-list").html("")
			notlariListele();
		},
		error: function (xhr, status, error) {
			console.log("not güncellenemedi");
		}
	});       
});
function tarihBicimlendir(isoTarih) {
    if (!isoTarih) {
        return "";
    }

    var tarih = new Date(isoTarih);
    return tarih.toLocaleDateString();
}
function girisKontrol() {
    if (pathname.endsWith("/giris.html")) return;

    var accessToken = getAccessToken();

    if (!accessToken) {
        window.location.href = "giris.html";
        return;
    }

    // token şu an elimizde ama geçerli mi?
    $.ajax({
        type: "get",
        headers: getAuthHeaders(),
        url: apiUrl + "api/Account/UserInfo",
        success: function (data) {
            console.log(data)
			$('#btnCikisYap').html("("+data.Email+" cikis yapmak icin tikla"+")")
            // notlariListele();
            $(".gizle").removeClass("gizle");
        },
        error: function () {
            window.location.href = "giris.html";
        }
    });
}
$("#btnCikisYap").click(function (event) {
    event.preventDefault();
    localStorage.removeItem("login");
    sessionStorage.removeItem("login");
    window.location.href = "giris.html";
});
girisKontrol();

function myFunction() {
  
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    ul = document.getElementById("notes-list");
    li = ul.getElementsByTagName("li");
    for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("textarea")[0];
        txtValue = a.textContent || a.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}
