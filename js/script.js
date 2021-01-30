var apiUrl = "https://notapi.selcukaltas.site/";
var pathname = window.location.pathname;

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

    return loginData.access_token; //logindata.token
}

function getAuthHeaders() {
    return { Authorization: "Bearer " + getAccessToken() };
}
$("#frmGiris").submit(function (event) {
    var frmGiris = this;
    var hatirla = $("#rememberme").prop("checked"); // true | false
    event.preventDefault();

    $.ajax({
        type: "post",
        url: apiUrl + "Token",
        data: {
            grant_type: "password",
            username: $("#inputEmail").val(),
            password: $("#inputPassword").val()
        },
        success: function (data) {
            frmGiris.reset();
            localStorage.removeItem("login");
            sessionStorage.removeItem("login");
            var storage = hatirla ? localStorage : sessionStorage;
            storage["login"] = JSON.stringify(data);

            toastr.success("Giriş başarılı.Notlarına gidiliyor.")
            setTimeout(function () {
                location.href = "./";
            }, 1000);
        },
        error: function (xhr, status, error) {
            toastr.error("Kullanıcı adı ve parola yanlış")
            frmGiris.reset();

        }
    });
});


$("#frmRegister").submit(function (e) {
    e.preventDefault();
    $.ajax({
        type: "post",
        url: apiUrl + "api/Account/Register",
        data: {
            Email: $("#inputKayitEmail").val(),
            Password: $("#inputKayitSifre").val(),
            ConfirmPassword: $("#inputReKayitSifre").val()
        },
        success: function (data) {
            toastr.success("Hesabınız başarıyla oluşturuldu");
	        container.classList.remove("right-panel-active");
        },
        error: function (xhr, status, error) {
       
            if (xhr.responseText == '{"Message":"The request is invalid.","ModelState":{"model.ConfirmPassword":["The password and confirmation password do not match."]}}') {
                toastr.error("Şifreler eşleşmiyor. Tekrar deneyiniz.")
            }
            else if (xhr.responseText.includes("Name")) {
                toastr.error($("#inputKayitEmail").val() + " email adresi daha önce kayıt olmuştur.Tekrar deneyiniz.")
            }
            else if (xhr.responseText.includes("uppercase")){
                toastr.error("Şifre en azından bir tane büyük harf,özel karakter veya sayı icermelidir.")
            }
            else if (xhr.responseText=='{"Message":"The request is invalid.","ModelState":{"model.Password":["The Password must be at least 6 characters long."]}}'){
                toastr.error("Şifre en az 6 karakter uzunluğunda olmalıdır.")
            }
        }
    });
});

$(document).ajaxStart(function () {
    $("#loading").removeClass("d-none");
});

$(document).ajaxStop(function () {
    $("#loading").addClass("d-none");
});
