fn main(x: pub Field, y : pub Field) -> pub Field {
    constrain x == y;
    x + y 
}