
export type ToastType = 'danger' | 'success' | 'info' | 'warning'

export const timeout_never = 0;
export const timeout_default = 3000; // 3s

export function showToast(message: string, type: ToastType, timeout = timeout_default, tid = '') {
    const template = document.getElementById('toastTemplate');
    if (template) {
        if (tid != '') {
            const t = document.getElementById(tid);
            if (t) {
                return;
            }
        }
        const temp = template.cloneNode(true) as HTMLElement;
        if (tid) {
            temp.setAttribute('id', tid);
        } else {
            temp.removeAttribute('id');
        }
        if (type == 'danger') {
            temp.classList.add('text-bg-danger');
        } else if(type == 'success') {
            temp.classList.add('text-bg-success');
        } else if(type == 'info') {
            temp.classList.add('text-bg-info');
        } else if(type == 'warning') {
            temp.classList.add('text-bg-warning');
        }
        temp.classList.add('show');
        const body = temp.getElementsByClassName('toast-body');
        if (body) {
            body[0].textContent = message;
        }
        temp.addEventListener('hidden.bs.toast', () => {
            temp.remove();
        })
        template.parentElement?.appendChild(temp);
        if (timeout > 0) {
            setTimeout(() => {
                temp.getElementsByTagName('button')[0].click();
            }, timeout);
        }
        
    }
}
