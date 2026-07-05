import java.sql.Connection;
import java.sql.DriverManager;
import java.util.Properties;

public class TestTurso {
    public static void main(String[] args) throws Exception {
        Class.forName("com.dbeaver.jdbc.driver.libsql.LibSqlDriver");
        String url = "jdbc:dbeaver:libsql:https://agri-compass-utsavmn.aws-ap-south-1.turso.io";
        Properties props = new Properties();
        props.setProperty("password", "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODMyNzA0NzgsImlkIjoiMDE5ZDI5OGUtOTkwMS03OTE3LWI5YmMtMmY3NDBmMDQ2YjAyIiwia2lkIjoiY3BuYll6czlOSlJMWE1vSjIxM2owU0F2SWZHUVZwZ29XNEFoR1NES01SdyIsInJpZCI6ImNjMGQzMDFiLWMzNTEtNGJlMi1hOGU2LTcyMGQwYzMyYzVhMyJ9.mNRX8iHg9csEKkzu7vLaLzQ6mEW-3MLaH8UkfwbCzWjEvhTkEWqKNjgtKd_v1k3RG349EvAyLsBDHNLHJ1_hCQ");
        System.out.println("Connecting...");
        try (Connection conn = DriverManager.getConnection(url, props)) {
            System.out.println("Success! Connected to Turso.");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
