/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9812382739212008, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9839211618257261, 500, 1500, "SelectFlight"], "isController": false}, {"data": [0.9845995893223819, 500, 1500, "NavForSignOFF"], "isController": false}, {"data": [0.9746376811594203, 500, 1500, "OpenFindFlights"], "isController": false}, {"data": [0.9834710743801653, 500, 1500, "NavToFlights"], "isController": false}, {"data": [0.970164609053498, 500, 1500, "OpenHome"], "isController": false}, {"data": [0.9891078838174274, 500, 1500, "PaymentDet"], "isController": false}, {"data": [0.9773895169578622, 500, 1500, "Login"], "isController": false}, {"data": [0.992299794661191, 500, 1500, "OpenWebTours"], "isController": false}, {"data": [0.9773429454170958, 500, 1500, "NavForLogin"], "isController": false}, {"data": [0.9777892561983471, 500, 1500, "ClickFlights"], "isController": false}, {"data": [0.9829192546583851, 500, 1500, "FillSearch"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 10660, 0, 0.0, 308.7947467166982, 212, 574, 300.0, 355.0, 485.0, 537.0, 17.76281805608785, 36.34027568766351, 14.036901705151385], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["SelectFlight", 964, 0, 0.0, 308.8755186721994, 218, 574, 299.0, 354.5, 487.0, 526.0, 1.6175880822016648, 4.791592773668553, 1.5263257505046575], "isController": false}, {"data": ["NavForSignOFF", 974, 0, 0.0, 309.39117043121115, 216, 574, 302.0, 362.0, 464.75, 538.25, 1.6236580649463226, 4.7649536417700205, 0.9291636973227979], "isController": false}, {"data": ["OpenFindFlights", 966, 0, 0.0, 312.21842650103525, 216, 574, 298.0, 442.30000000000007, 501.0, 528.0, 1.6163955383467252, 7.00069747321067, 1.1666178711685904], "isController": false}, {"data": ["NavToFlights", 968, 0, 0.0, 306.83987603305735, 212, 559, 301.0, 350.0, 445.44999999999914, 540.0, 1.6182717593188547, 2.732413937365527, 1.1663914692168935], "isController": false}, {"data": ["OpenHome", 972, 0, 0.0, 315.23456790123515, 219, 574, 302.0, 406.0, 510.0, 539.27, 1.6231705932254339, 1.8118268622208715, 1.135055683768962], "isController": false}, {"data": ["PaymentDet", 964, 0, 0.0, 304.6991701244812, 226, 574, 301.0, 352.0, 367.5, 538.0, 1.617903003022659, 4.444594925297861, 1.8111674249538043], "isController": false}, {"data": ["Login", 973, 0, 0.0, 314.81089414182946, 216, 554, 302.0, 361.0, 498.29999999999995, 537.0, 1.6236583542478773, 1.303470668812076, 1.2723566559354476], "isController": false}, {"data": ["OpenWebTours", 974, 0, 0.0, 298.4373716632441, 215, 555, 292.0, 344.0, 364.25, 516.25, 1.6238340154881088, 1.611147812242108, 1.0877572668239373], "isController": false}, {"data": ["NavForLogin", 971, 0, 0.0, 309.9577754891868, 220, 559, 303.0, 350.0, 489.0, 540.0, 1.6220993072249406, 2.738876662296799, 1.1422270658169718], "isController": false}, {"data": ["ClickFlights", 968, 0, 0.0, 301.4297520661158, 212, 559, 292.0, 342.0, 480.0, 527.31, 1.6185423421043392, 1.1617467006315325, 1.1618446721866542], "isController": false}, {"data": ["FillSearch", 966, 0, 0.0, 314.8498964803312, 219, 573, 309.0, 357.0, 488.0, 539.0, 1.617166743953621, 4.121033227879888, 1.690275568624119], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 10660, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
