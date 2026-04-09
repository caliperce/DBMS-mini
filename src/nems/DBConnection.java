package nems;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBConnection {

    // ================================================================
    //  UPDATE THESE VALUES TO MATCH YOUR ORACLE DATABASE INSTALLATION
    // ================================================================
    private static final String URL  = "jdbc:oracle:thin:@localhost:1521:xe";
    private static final String USER = "system";
    private static final String PASS = "oracle";

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASS);
    }
}
