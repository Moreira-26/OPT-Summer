<script setup>

    const emit = defineEmits(['closeModal'])

  function close(){
      //Emit close Modal event to parent
      emit('closeModal')
  }

</script>

<template>
    <div class="centermodal-backdrop" @keyup.esc.exact="close">
      <div class="centermodal">
        <header class="centermodal-header">
          <slot name="header">
            This is the default title!
          </slot>
          <button type="button" class="btn-close" @click="close">x</button>
        </header>
  
        <section class="centermodal-body">
          <slot name="body">
            This is the default body!
          </slot>
         </section>
  
        <footer class="centermodal-footer">
          <slot name="footer">
            babyGIST
          </slot>
        </footer>
      </div>
    </div>
</template>

<style>
  .centermodal-backdrop {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.3);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .centermodal {
    background: #000000;
    box-shadow: 2px 2px 20px 1px;
    overflow-x: auto;
    display: flex;
    flex-direction: column;
  }

  .centermodal-header,
  .centermodal-footer {
    padding: 15px;
    display: flex;
  }

  .centermodal-header {
    position: relative;
    border-bottom: 1px solid #eeeeee;
    color: #4AAE9B;
    justify-content: space-between;
  }

  .centermodal-footer {
    border-top: 1px solid #eeeeee;
    flex-direction: column;
    justify-content: flex-end;
  }

  .centermodal-body {
    position: relative;
    padding: 20px 10px;
  }

  .btn-close {
    position: absolute;
    top: 0;
    right: 0;
    border: none;
    font-size: 20px;
    padding: 10px;
    cursor: pointer;
    font-weight: bold;
    color: #4AAE9B;
    background: transparent;
  }

  .btn-green {
    color: white;
    background: #4AAE9B;
    border: 1px solid #4AAE9B;
    border-radius: 2px;
  }
</style>