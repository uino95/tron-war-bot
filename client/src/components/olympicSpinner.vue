<template>
    <div class="spinner-container">
        <div class="spinner"></div>
        <div class="spinner"></div>
        <div class="spinner"></div>
        <div class="spinner"></div>
        <div class="spinner"></div>
    </div>
</template>

<script>

</script>

<style lang="scss" scoped>
// Variables ========================
$blue: #0085C7;
$yellow: #F4C300;
$black: #000000;
$green: #009F3D;
$red: #DF0024;

html{
	height: 100%;
}

body{
	display: flex;
	flex:{
		direction: column;
	}
	align:{
		items: center;
	}
	justify-content: center;
	height: 100%;
}

.spinner-container{
	display: flex;
	flex:{
		direction: row;
	}
}
.spinner{
	flex:{
		grow: 0;
		shrink: 0;
	}
	width: 80px;
	height: 80px;
	margin-left: -36px;
	background: none;
	border-radius: 50%;
	border: 6px solid currentColor;
	box-sizing: border-box;
	animation:{
		name: spin;
		duration: 2.4s;
		// direction: alternate
		fill-mode: backwards;
		iteration-count: infinite;
		timing-function: linear;
	}
	&:first-child{
		margin-left: 0;
		color: transparentize($blue,0.8);
		border-top-color: $blue;
	}

	&:nth-child(2){
		color: transparentize($yellow,0.8);
		border-top-color: $yellow;	
		animation-delay: 0.3s;
	}

	&:nth-child(3){
		color: transparentize($black,0.8);
		border-top-color: $black;
		animation-delay: 0.6s;
	}

	&:nth-child(4){
		color: transparentize($green,0.8);
		border-top-color: $green;
		animation-delay: 0.9s;
	}
	
	&:nth-child(5){
		color: transparentize($red,0.8);
		border-top-color: $red	;
		animation-delay: 1.2s;	
	}
	
	&:nth-child(2n){
		margin-top: 40px;
	}
    
    @keyframes spin {
        0%{
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
}
</style>
