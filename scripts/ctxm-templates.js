ctxm = {
    header: (elm) => {
        return `<h5 class="mb-0">constraint id: ${elm.id}</h5>`
    },
    constraintType: (elm) => {
        return `<div class="input-group">
            <label class="input-group-text">constraint-type: </label>
            <select class="custom-select" id="select-type">
                <option value="tran" ${(elm.type === 'tran' ? 'selected' : '')}>tran</option>
                <option value="rot"  ${(elm.type === 'rot' ? 'selected' : '')}>rot</option>
                <option value="free" ${(elm.type === 'free' ? 'selected' : '')}>free</option>
                <option value="ctrl" ${(elm.type === 'ctrl' ? 'selected' : '')}>ctrl</option>
            </select>
        </div>`
    },
    oriType: (elm) => {
        return `<div class="input-group mt-1">
            <label class="input-group-text">ori-type: </label>
            <select class="custom-select" id="select-ori-type">
                <option value="free" ${(elm.ori.type === 'free' ? 'selected' : '')}>free</option>
                <option value="ref"  ${(elm.ori.type === 'ref' ? 'selected' : '')}>ref</option>
             <!-- <option value="drive" ${(elm.ori.type === 'drive' ? 'selected' : '')}>drive</option> -->
            </select>
        </div>`
    },
    lenType: (elm) => {
        return `<div class="input-group mt-1">
            <label class="input-group-text">len-type: </label>
            <select class="custom-select" id="select-len-type">
                <option value="free" ${(elm.len.type === 'free' ? 'selected' : '')}>free</option>
                <option value="ref"  ${(elm.len.type === 'ref' ? 'selected' : '')}>ref</option>
             <!-- <option value="drive" ${(elm.len.type === 'drive' ? 'selected' : '')}>drive</option> -->
            </select>
        </div>`
    },
    ref: (elm) => {
        let select = `<div class="input-group mt-1">
        <label class="input-group-text">referenced: </label>
        <select class="custom-select" id="select-ref">`; // add head

        app.model.constraints.forEach(el => { //  add options
            if (!(el.id === elm.id))
                select += `<option value="${el.id}" ${(elm.ori.ref.id === el.id ? 'selected' : '')}>${el.id}</option>`
        });

        select += `</select></div>`; // add tail

        return select
    },
};