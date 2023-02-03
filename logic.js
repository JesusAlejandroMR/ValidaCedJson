var jsonFinal = [];

function Validar() {
    var jsonPrincipal;
    fetch("./data.json")
        .then(response => {
            return response.json();
        })
        .then(function (jsondata) {
            jsonPrincipal = jsondata;
            console.log(jsonPrincipal);
            jsonPrincipal.forEach(element =>
                jsonFinal.push({
                    "id_tipo": element.id_tipo,
                    "ced": element.Cedula,
                    "Nombre":element.Nombre,
                    "Ciudad":element.Ciudad,
                    "telefono":element.telefono,
                    "correo":element.correo,
                    "cta_contable":element.cta_contable,
                    "status": verificaCed(element)
                })
            );
            if (jsonPrincipal.length == jsonFinal.length) {
                Swal.fire({
                    icon: 'success',
                    title: 'Finish...',
                    text: 'Validación completada!'
                })
            }

        });
};

function generaTabla() {
    //Inicio de configuración DataTAble    
    $('#gridContainer').dxDataGrid({
        dataSource: jsonFinal,
        keyExpr: 'ced',
        showBorders: true,
        groupPanel: {
            visible: true,
        },
        wordWrapEnabled: true,
        columnFixing: { enabled: true },
        columns: [
            {
                caption: 'Tipo documento',
                dataField: 'id_tipo',
            },{
                caption: 'Cédula ',
                dataField: 'ced',
            }, {
                caption: 'Nombre',
                dataField: 'Nombre',
            }, {
                caption: 'Ciudad',
                dataField: 'Ciudad',
            }, {
                caption: 'Telefono',
                dataField: 'telefono',
            }, {
                caption: 'Correo',
                dataField: 'correo',
            }, {
                caption: 'Cuenta contable',
                dataField: 'cta_contable',
            }, {
                caption: 'Estado registro',
                dataField: 'status',
            }
        ],
        export: {
            enabled: true,
            allowExportSelectedData: true,
        },
        onExporting(e) {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('ced');

            DevExpress.excelExporter.exportDataGrid({
                component: e.component,
                worksheet,
                autoFilterEnabled: true,
            }).then(() => {
                workbook.xlsx.writeBuffer().then((buffer) => {
                    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Clientes.xlsx');
                });
            });
            e.cancel = true;
        },
        scrolling: {
            rowRenderingMode: 'virtual',
        },
        paging: {
            pageSize: 20,
        },
        pager: {
            visible: true,
            allowedPageSizes: [25, 50, 100],
            showPageSizeSelector: true,
            showInfo: true,
            showNavigationButtons: true,
        },
    })
}

function verificaCed(cedula) {
    let id = String(cedula.Cedula);
    if (typeof (id) == 'string' && id.length >= 10 && id.length <= 13 && /^\d+$/.test(id)) {
        var digitos = id.split('').map(Number);
        var codigo_provincia = digitos[0] * 10 + digitos[1];
        if (digitos.length == 13) {
            digitos = digitos.splice(0, 10);
        }
        if (codigo_provincia >= 1 && (codigo_provincia <= 24 || codigo_provincia == 30)) {
            var digito_verificador = digitos.pop();
            var digito_calculado = digitos.reduce(
                function (valorPrevio, valorActual, indice) {
                    return valorPrevio - (valorActual * (2 - indice % 2)) % 9 - (valorActual == 9) * 9;
                }, 1000) % 10;
            return digito_calculado === digito_verificador;
        }
    }
    return false;
}